import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createClient } from '@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Fetch Open Graph image from URL
async function fetchOgImage(url: string): Promise<string | null> {
  try {
    console.log('Fetching OG image for URL:', url);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WishlistBot/1.0)',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    if (!response.ok) {
      console.log('Failed to fetch URL:', response.status);
      return null;
    }
    
    const html = await response.text();
    
    // Try to find og:image meta tag
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);
    
    if (ogImageMatch && ogImageMatch[1]) {
      let imageUrl = ogImageMatch[1];
      // Handle relative URLs
      if (imageUrl.startsWith('//')) {
        imageUrl = 'https:' + imageUrl;
      } else if (imageUrl.startsWith('/')) {
        const urlObj = new URL(url);
        imageUrl = urlObj.origin + imageUrl;
      } else if (!imageUrl.startsWith('http')) {
        const urlObj = new URL(url);
        imageUrl = urlObj.origin + '/' + imageUrl;
      }
      console.log('Found OG image:', imageUrl);
      return imageUrl;
    }
    
    // Fallback to twitter:image
    const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                             html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["'][^>]*>/i);
    
    if (twitterImageMatch && twitterImageMatch[1]) {
      let imageUrl = twitterImageMatch[1];
      // Handle relative URLs
      if (imageUrl.startsWith('//')) {
        imageUrl = 'https:' + imageUrl;
      } else if (imageUrl.startsWith('/')) {
        const urlObj = new URL(url);
        imageUrl = urlObj.origin + imageUrl;
      } else if (!imageUrl.startsWith('http')) {
        const urlObj = new URL(url);
        imageUrl = urlObj.origin + '/' + imageUrl;
      }
      console.log('Found Twitter image:', imageUrl);
      return imageUrl;
    }
    
    console.log('No OG image found in HTML');
    return null;
  } catch (error) {
    console.log('Error fetching OG image:', error);
    return null;
  }
}

// Sign up route
app.post('/make-server-a8f4bfaf/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Server error during signup:', error);
    return c.json({ error: 'Server error during signup' }, 500);
  }
});

// Create wishlist
app.post('/make-server-a8f4bfaf/wishlists', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name, description } = await c.req.json();
    
    if (!name) {
      return c.json({ error: 'Name is required' }, 400);
    }

    const wishlistId = crypto.randomUUID();
    const shareToken = crypto.randomUUID();
    
    const wishlist = {
      id: wishlistId,
      userId: user.id,
      name,
      description: description || '',
      shareToken,
      createdAt: new Date().toISOString(),
      items: []
    };

    await kv.set(`wishlist:${wishlistId}`, wishlist);
    
    // Add to user's wishlist index
    const userWishlists = await kv.get(`user:${user.id}:wishlists`) || [];
    userWishlists.push(wishlistId);
    await kv.set(`user:${user.id}:wishlists`, userWishlists);

    return c.json({ wishlist });
  } catch (error) {
    console.log('Error creating wishlist:', error);
    return c.json({ error: 'Failed to create wishlist' }, 500);
  }
});

// Get user's wishlists
app.get('/make-server-a8f4bfaf/wishlists', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const wishlistIds = await kv.get(`user:${user.id}:wishlists`) || [];
    const wishlists = await kv.mget(wishlistIds.map(id => `wishlist:${id}`));

    return c.json({ wishlists: wishlists.filter(w => w !== null) });
  } catch (error) {
    console.log('Error fetching wishlists:', error);
    return c.json({ error: 'Failed to fetch wishlists' }, 500);
  }
});

// Get wishlist by share token (public access)
app.get('/make-server-a8f4bfaf/wishlists/shared/:shareToken', async (c) => {
  try {
    const { shareToken } = c.req.param();
    
    const allWishlists = await kv.getByPrefix('wishlist:');
    const wishlist = allWishlists.find(w => w && w.shareToken === shareToken);

    if (!wishlist) {
      return c.json({ error: 'Wishlist not found' }, 404);
    }

    return c.json({ wishlist });
  } catch (error) {
    console.log('Error fetching shared wishlist:', error);
    return c.json({ error: 'Failed to fetch wishlist' }, 500);
  }
});

// Get single wishlist (owner only)
app.get('/make-server-a8f4bfaf/wishlists/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { id } = c.req.param();
    const wishlist = await kv.get(`wishlist:${id}`);

    if (!wishlist) {
      return c.json({ error: 'Wishlist not found' }, 404);
    }

    if (wishlist.userId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    return c.json({ wishlist });
  } catch (error) {
    console.log('Error fetching wishlist:', error);
    return c.json({ error: 'Failed to fetch wishlist' }, 500);
  }
});

// Add item to wishlist
app.post('/make-server-a8f4bfaf/wishlists/:id/items', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { id } = c.req.param();
    const { url, description, title, ogImageUrl } = await c.req.json();
    
    if (!url && !description) {
      return c.json({ error: 'URL or description is required' }, 400);
    }

    const wishlist = await kv.get(`wishlist:${id}`);

    if (!wishlist) {
      return c.json({ error: 'Wishlist not found' }, 404);
    }

    if (wishlist.userId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const item = {
      id: crypto.randomUUID(),
      title: title || '',
      url: url || '',
      description: description || '',
      addedAt: new Date().toISOString(),
      claimed: false,
      ogImageUrl: ogImageUrl || ''
    };

    wishlist.items.push(item);
    await kv.set(`wishlist:${id}`, wishlist);

    return c.json({ item, wishlist });
  } catch (error) {
    console.log('Error adding item:', error);
    return c.json({ error: 'Failed to add item' }, 500);
  }
});

// Delete item from wishlist
app.delete('/make-server-a8f4bfaf/wishlists/:id/items/:itemId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { id, itemId } = c.req.param();
    const wishlist = await kv.get(`wishlist:${id}`);

    if (!wishlist) {
      return c.json({ error: 'Wishlist not found' }, 404);
    }

    if (wishlist.userId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    wishlist.items = wishlist.items.filter(item => item.id !== itemId);
    await kv.set(`wishlist:${id}`, wishlist);

    return c.json({ success: true, wishlist });
  } catch (error) {
    console.log('Error deleting item:', error);
    return c.json({ error: 'Failed to delete item' }, 500);
  }
});

// Update item claimed status
app.patch('/make-server-a8f4bfaf/wishlists/:id/items/:itemId/claim', async (c) => {
  try {
    const { id, itemId } = c.req.param();
    const { claimed } = await c.req.json();
    
    const wishlist = await kv.get(`wishlist:${id}`);

    if (!wishlist) {
      return c.json({ error: 'Wishlist not found' }, 404);
    }

    const item = wishlist.items.find(item => item.id === itemId);
    if (!item) {
      return c.json({ error: 'Item not found' }, 404);
    }

    item.claimed = claimed;
    await kv.set(`wishlist:${id}`, wishlist);

    return c.json({ success: true, wishlist });
  } catch (error) {
    console.log('Error updating item:', error);
    return c.json({ error: 'Failed to update item' }, 500);
  }
});

// Update item details (owner only)
app.patch('/make-server-a8f4bfaf/wishlists/:id/items/:itemId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { id, itemId } = c.req.param();
    const { title, url, description, ogImageUrl } = await c.req.json();
    
    const wishlist = await kv.get(`wishlist:${id}`);

    if (!wishlist) {
      return c.json({ error: 'Wishlist not found' }, 404);
    }

    if (wishlist.userId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const item = wishlist.items.find(item => item.id === itemId);
    if (!item) {
      return c.json({ error: 'Item not found' }, 404);
    }

    // Update item properties
    if (title !== undefined) item.title = title;
    if (url !== undefined) item.url = url;
    if (description !== undefined) item.description = description;
    if (ogImageUrl !== undefined) item.ogImageUrl = ogImageUrl;

    await kv.set(`wishlist:${id}`, wishlist);

    return c.json({ success: true, item, wishlist });
  } catch (error) {
    console.log('Error updating item details:', error);
    return c.json({ error: 'Failed to update item details' }, 500);
  }
});

// Update wishlist details (owner only)
app.patch('/make-server-a8f4bfaf/wishlists/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { id } = c.req.param();
    const { name, description } = await c.req.json();
    
    const wishlist = await kv.get(`wishlist:${id}`);

    if (!wishlist) {
      return c.json({ error: 'Wishlist not found' }, 404);
    }

    if (wishlist.userId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Update wishlist properties
    if (name !== undefined) wishlist.name = name;
    if (description !== undefined) wishlist.description = description;

    await kv.set(`wishlist:${id}`, wishlist);

    return c.json({ success: true, wishlist });
  } catch (error) {
    console.log('Error updating wishlist details:', error);
    return c.json({ error: 'Failed to update wishlist details' }, 500);
  }
});

// Delete wishlist (owner only)
app.delete('/make-server-a8f4bfaf/wishlists/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { id } = c.req.param();
    const wishlist = await kv.get(`wishlist:${id}`);

    if (!wishlist) {
      return c.json({ error: 'Wishlist not found' }, 404);
    }

    if (wishlist.userId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await kv.del(`wishlist:${id}`);
    
    // Remove from user's wishlist index
    const userWishlists = await kv.get(`user:${user.id}:wishlists`) || [];
    const updatedWishlists = userWishlists.filter(wId => wId !== id);
    await kv.set(`user:${user.id}:wishlists`, updatedWishlists);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting wishlist:', error);
    return c.json({ error: 'Failed to delete wishlist' }, 500);
  }
});

Deno.serve(app.fetch);