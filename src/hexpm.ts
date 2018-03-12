import axios from 'axios';

const BASE_URL = 'https://hex.pm/api';

export function getPackage(name: String) {
  const url = `${BASE_URL}/packages/${name}`;
  return axios.get(url).then(res => res.data);
}
