export function save(key, value) {
  let valueToStore = value;

  if (typeof value !== "string") {
    valueToStore = JSON.stringify(value);
  }

  localStorage.setItem(key, valueToStore);
}

export function getToken() {
  const token = localStorage.getItem("token");

  return token;
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
}

export function clearStorage() {
  localStorage.clear();
}

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function getName() {
  return load("username");
}

export function load(key) {
  const value = localStorage.getItem(key);

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
