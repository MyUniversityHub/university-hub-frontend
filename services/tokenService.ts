// services/tokenService.ts
export class TokenService {
    private token: string | null = null;
    private expireTime: number = 0;
    private refreshIntervalId: number | null = null;

    constructor() {
        if (process.client) {
            this.loadTokenFromStorage();
        }
    }

    private loadTokenFromStorage() {
        if (process.client) {
            this.token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('auth_token='))
                ?.split('=')[1] || null;

            this.expireTime = parseInt(localStorage.getItem('token_expire_time') || '0');
            if (this.token && this.expireTime) {
                this.setupRefreshInterval();
            }
        }
    }

    public getToken(): string | null {
        return this.token;
    }

    public setToken(token: string | null, expireTime: number) {
        this.token = token;
        this.expireTime = expireTime;
        this.clearRefreshInterval();
        if (token) {
            this.setupRefreshInterval();
        }
    }

    private setupRefreshInterval() {
        const refreshTime = this.expireTime - new Date().getTime() - 60000; // 60 seconds before expiration
        if (refreshTime > 0) {
            this.refreshIntervalId = window.setTimeout(() => this.refreshToken(), refreshTime);
        }
    }

    private clearRefreshInterval() {
        if (this.refreshIntervalId) {
            clearTimeout(this.refreshIntervalId);
            this.refreshIntervalId = null;
        }
    }

    private async refreshToken() {
        const config = useRuntimeConfig();
        const nuxtApp = useNuxtApp();

        try {
            if (process.client) {
                const refreshToken = document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('refresh_token='))
                    ?.split('=')[1];

                if (!refreshToken) {
                    throw new Error('No refresh token found');
                }

                const response = await $fetch<{
                    status: boolean;
                    message: string;
                    data: {
                        token_type: string;
                        expires_in: number;
                        access_token: string;
                        refresh_token: string;
                    };
                }>(`${config.public.apiUrl}/refresh`, {
                    method: 'POST',
                    body: { refresh_token: refreshToken },
                });

                if (response.status && response) {
                    const now = new Date().getTime();
                    const { access_token, token_type, expires_in, refresh_token } = response.data;
                    this.setToken(access_token, now + expires_in * 1000);
                    useCookie('auth_token').value = access_token;
                    useCookie('token_type').value = token_type;
                    useCookie('refresh_token').value = refresh_token;
                    localStorage.setItem('token_expire_time', this.expireTime.toString());
                }
            }
        } catch (error) {
            nuxtApp.$toast?.error('Failed to refresh token. Please log in again.');
            useRouter().push('/login');
            throw error;
        }
    }
}

export const tokenService = new TokenService();