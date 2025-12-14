import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResetPassword } from './ResetPassword';
import * as supabaseClient from '../utils/supabase-client';

// Mock Supabase client
const mockUpdateUser = vi.fn();
const mockGetSession = vi.fn();
const mockSupabase = {
    auth: {
        updateUser: mockUpdateUser,
        getSession: mockGetSession,
    },
};

vi.mock('../utils/supabase-client', () => ({
    createClient: vi.fn(() => mockSupabase),
}));

describe('ResetPassword', () => {
    const mockOnSuccess = vi.fn();
    const mockOnCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Default to successful session check
        mockGetSession.mockResolvedValue({
            data: { session: { user: { id: '123' } } }
        });

        // Mock window.location for hash
        Object.defineProperty(window, 'location', {
            value: {
                hash: '#type=recovery',
            },
            writable: true,
        });
    });

    it('renders loading state initially', () => {
        render(<ResetPassword onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders invalid link message when type is not recovery', async () => {
        Object.defineProperty(window, 'location', {
            value: {
                hash: '#type=signup',
            },
            writable: true,
        });

        render(<ResetPassword onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

        await waitFor(() => {
            expect(screen.getByText('Invalid or Expired Link')).toBeInTheDocument();
        });
    });

    it('renders form when token is valid', async () => {
        render(<ResetPassword onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

        await waitFor(() => {
            expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
        });
    });

    it('validates password mismatch', async () => {
        render(<ResetPassword onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

        await waitFor(() => {
            expect(screen.getByLabelText('New Password')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'password456' } });

        fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
        expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it('validates password length', async () => {
        render(<ResetPassword onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

        await waitFor(() => {
            expect(screen.getByLabelText('New Password')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText('New Password'), { target: { value: '123' } });
        fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: '123' } });

        // Note: HTML5 validation might catch this first if we simulate submit properly, 
        // but the component also has manual check.
        fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
        expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it('calls updateUser on valid submission', async () => {
        mockUpdateUser.mockResolvedValue({ error: null });

        render(<ResetPassword onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

        await waitFor(() => {
            expect(screen.getByLabelText('New Password')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newpassword' } });
        fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'newpassword' } });

        fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

        await waitFor(() => {
            expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newpassword' });
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    it('handles errors during update', async () => {
        mockUpdateUser.mockResolvedValue({ error: { message: 'Supabase error' } });

        render(<ResetPassword onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

        await waitFor(() => {
            expect(screen.getByLabelText('New Password')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newpassword' } });
        fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'newpassword' } });

        fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

        await waitFor(() => {
            expect(screen.getByText('Supabase error')).toBeInTheDocument();
        });
    });
});
