import { toast } from 'react-toastify';

const apiUrl = '/api';
const contentTypeHeader = {
  'Content-type': 'application/json',
};

async function handleServerResponse(res) {
  if (!res.ok) {
    let message = 'Something went wrong, please try again later';
    if (res.status >= 400 && res.status < 500) {
      message = await res.json();
    }

    toast.error(message);
    throw new Error(message);
  }
  return res.json();
}

function callApi(url, options = {}, method, body) {
  options.headers = getHeaders(options, method && method !== 'GET');

  options = {
    ...options,
    ...(method && { method }),
    ...(body && { body: JSON.stringify(body) }),
  };

  return fetch(url, options).then(handleServerResponse);
}

function getHeaders(options, shouldIncludeContentType = true) {
  const headers = {
    ...options.headers,
    ...(shouldIncludeContentType && contentTypeHeader),
    ...(options.accessToken && {
      Authorization: `Bearer ${options.accessToken}`,
    }),
  };

  delete options.accessToken;

  return headers;
}

export function configureApi(endpoint) {
  const url = `${apiUrl}/${endpoint}`;

  async function getOne(criteria, options = {}) {
    let searchParams = new URLSearchParams(criteria);
    return (await getList(searchParams.toString(), options))[0];
  }

  function getList(search = '', page = 1, options = {}) {
    search = `?${search}&page=${page}`;

    return callApi(`${url}${search}`, options);
  }

  function create(body, options = {}) {
    return callApi(url, options, 'POST', body);
  }

  function update(id, body, options = {}) {
    return callApi(`${url}/${id}`, options, 'PATCH', body);
  }

  function remove(id, options = {}) {
    return callApi(`${url}/${id}`, options, 'DELETE');
  }

  return {
    getOne,
    getList,
    create,
    update,
    remove,
  };
}
