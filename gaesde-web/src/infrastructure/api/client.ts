import { env } from '../../core/config/env';
import { HttpClient } from '../../core/http/httpClient';

export const apiClient = new HttpClient(env.apiBaseUrl);
