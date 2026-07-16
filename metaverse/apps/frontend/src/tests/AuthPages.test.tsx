import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SigninPage } from '../pages/SigninPage';
import { useAuthStore } from '../store/authStore';
import * as api from '../api';

// Mock the react-oauth/google module
vi.mock('@react-oauth/google', () => ({
    GoogleLogin: ({ onSuccess, onError }: any) => (
        <div data-testid="google-login-btn">
            <button onClick={() => onSuccess({ credential: 'mock-google-token' })}>
                Simulate Google Success
            </button>
            <button onClick={() => onError()}>
                Simulate Google Error
            </button>
        </div>
    )
}));

// Mock the API calls
vi.mock('../api', () => ({
    googleSignin: vi.fn(),
    signin: vi.fn()
}));

// Mock the Auth Store
vi.mock('../store/authStore', () => ({
    useAuthStore: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('Frontend Google Authentication', () => {
    let mockSetAuth: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockSetAuth = vi.fn();
        (useAuthStore as any).mockReturnValue({
            setAuth: mockSetAuth
        });
    });

    it('should render the Google Sign-In button', () => {
        render(
            <BrowserRouter>
                <SigninPage />
            </BrowserRouter>
        );
        expect(screen.getByTestId('google-login-btn')).toBeInTheDocument();
    });

    it('should successfully login and navigate to dashboard on Google Success', async () => {
        (api.googleSignin as any).mockResolvedValue({
            status: 200,
            data: { token: 'mock-jwt-token' }
        });

        render(
            <BrowserRouter>
                <SigninPage />
            </BrowserRouter>
        );

        // Click our mocked success button
        fireEvent.click(screen.getByText('Simulate Google Success'));

        await waitFor(() => {
            expect(api.googleSignin).toHaveBeenCalledWith('mock-google-token');
        });

        expect(mockSetAuth).toHaveBeenCalledWith('mock-jwt-token');
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should display an error message if Google API login fails', async () => {
        (api.googleSignin as any).mockRejectedValue({
            response: { data: { message: 'Google Token Invalid' } }
        });

        render(
            <BrowserRouter>
                <SigninPage />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByText('Simulate Google Success'));

        await waitFor(() => {
            expect(screen.getByText('Google Token Invalid')).toBeInTheDocument();
        });

        expect(mockSetAuth).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should display an error message if Google button itself throws an error', async () => {
        render(
            <BrowserRouter>
                <SigninPage />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByText('Simulate Google Error'));

        await waitFor(() => {
            expect(screen.getByText('An unexpected error occurred with Google Sign-in.')).toBeInTheDocument();
        });
        
        expect(api.googleSignin).not.toHaveBeenCalled();
    });
});
