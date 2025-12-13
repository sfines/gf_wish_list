# Supabase Configuration for Password Reset

This document describes the necessary Supabase configuration to ensure password reset links work correctly.

## Problem

Password reset emails sent by Supabase were pointing to an incorrect URL, preventing users from resetting their passwords.

## Solution

### 1. Configure Site URL in Supabase Dashboard

The primary fix is to configure the Site URL in the Supabase project settings:

1. Go to your Supabase project dashboard: https://app.supabase.com/project/mlfypfplrgnxgioxndsv
2. Navigate to **Authentication** → **URL Configuration**
3. Set the **Site URL** to: `https://wishlist.goodandfine.com`
4. Add the following to **Redirect URLs**:
   - `https://wishlist.goodandfine.com`
   - `https://wishlist.goodandfine.com/reset-password`

### 2. Email Templates (Optional)

You can also customize the email templates to ensure they use the correct domain:

1. Navigate to **Authentication** → **Email Templates**
2. Select the **Reset Password** template
3. Ensure the reset link uses: `{{ .SiteURL }}/reset-password?token={{ .TokenHash }}&type=recovery`

The `{{ .SiteURL }}` variable will use the Site URL configured in step 1.

## Environment Configuration

The application uses an environment variable to configure the redirect URL:

1. Copy `.env.example` to `.env.local`
2. Set `VITE_APP_URL` to your domain (defaults to `https://wishlist.goodandfine.com`)

For local development:
```
VITE_APP_URL=http://localhost:5173
```

For production:
```
VITE_APP_URL=https://wishlist.goodandfine.com
```

## How It Works

1. When a user requests a password reset, the application calls `supabase.auth.resetPasswordForEmail()` with:
   ```typescript
   redirectTo: PASSWORD_RESET_REDIRECT_URL  // Configured from VITE_APP_URL env var
   ```

2. Supabase sends an email with a link to the specified `redirectTo` URL with authentication tokens in the URL hash.

3. The application detects the `type=recovery` parameter and shows the password reset form.

4. After the user enters a new password, the application calls `supabase.auth.updateUser()` to update the password.

5. The user is automatically signed in with the new password.

## Testing

To test the password reset flow:

1. Go to the sign-in page
2. Click "Forgot your password?"
3. Enter your email address
4. Check your email for the reset link
5. Click the link (should go to `https://wishlist.goodandfine.com/reset-password`)
6. Enter and confirm your new password
7. You should be automatically signed in

## Important Notes

- The Site URL must match the domain where your application is hosted
- Both HTTP and HTTPS redirect URLs should be configured if needed
- For development, you may want to add `http://localhost:5173/reset-password` to the Redirect URLs
- The password reset link expires after a certain time (configurable in Supabase settings)
- The `VITE_APP_URL` environment variable should match the domain configured in Supabase
- Make sure to set the environment variable in your deployment platform (Vercel, Netlify, etc.)
