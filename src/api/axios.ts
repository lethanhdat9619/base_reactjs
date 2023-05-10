import Axios from 'axios';
import Cookies from 'js-cookie';
import { history } from '../hooks/useHistory';
import configs from '../config';
import { STATUS_CODE, ACCESS_TOKEN } from '../utils/constants';

const axiosInstance = Axios.create({
  timeout: 3 * 60 * 1000,
  baseURL: configs.API_DOMAIN,
});

axiosInstance.interceptors.request.use(
  (config) => {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${Cookies.get(ACCESS_TOKEN)}`;
    return config;
  },
  (error) => console.log(error)
);

const logout = () => {
  Cookies.remove("");
  history.push('/');
};
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: any) => {
    const originalConfig = error.config;
    if (Object.values(STATUS_CODE).indexOf(error.response.status) > -1) {
      if (error.response.status === STATUS_CODE.HTTP_UNAUTHORIZED) {
        logout();
        history.push('/login');
      }
      return console.log(error);
    }
    const refreshToken = Cookies.get('refreshToken');
    if (!refreshToken) {
      logout();
      return Promise.reject(error);
    }
    return Axios.post(`${configs.API_DOMAIN}/auth/request-access-token`, {
      refreshToken,
    })
      .then((res) => {
        if (res.status === 200) {
          const data = res.data.data;
          Cookies.set(ACCESS_TOKEN, data.token);
          originalConfig.headers.Authorization = `Bearer ${data.token}`;
          return Axios(originalConfig);
        } else {
          // logout();
          return Promise.reject(error);
        }
      })
      .catch(() => {
        // logout();
        return Promise.reject(error);
      });
  }
);

export const sendGet = (url: string, params?: any) => axiosInstance.get(url, { params }).then((res) => res.data);
export const sendPost = (url: string, params?: any, queryParams?: any) =>
  axiosInstance.post(url, params, { params: queryParams }).then((res) => res.data);
export const sendPut = (url: string, params?: any) => axiosInstance.put(url, params).then((res) => res.data);
export const sendPatch = (url: string, params?: any) => axiosInstance.patch(url, params).then((res) => res.data);
export const sendDelete = (url: string, params?: any) => axiosInstance.delete(url, { params }).then((res) => res.data);
export const sendCustom = (params = {}) => axiosInstance(params).then((res) => res);