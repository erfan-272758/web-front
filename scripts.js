// initial variables
const errorContainer = document.querySelector("#error_container");
const errorMsg = document.querySelector("#error_msg");
const form = document.querySelector("form");
const formUsername = document.querySelector("#username");
const profileImage = document.querySelector("#profile_image");
const profileName = document.querySelector("#title_name");
const profileUsername = document.querySelector("#title_username");
const profileLoc = document.querySelector("#title_loc");
const profileDescription = document.querySelector("#description");
const BASE_URL = "https://api.github.com/users";
function hideError() {
  // add gone class name to error container
  errorContainer.classList.add("gone");
}

function showError(msg) {
  // remove gone class name and set text
  errorContainer.classList.remove("gone");
  errorMsg.textContent = msg;
}

function setProfile({
  login: username,
  avatar_url: photo,
  name,
  company,
  location,
  bio,
  email,
}) {
  // name
  profileName.textContent = name;

  // username
  profileUsername.textContent = `@${username}`;

  // photo
  if (!photo) profileImage.classList.add("gone");
  else profileImage.classList.remove("gone");
  profileImage.src = photo;

  //location
  profileLoc.textContent = location;

  //description
  const des = [company, email, bio].filter((d) => d).join("\n\n");
  profileDescription.textContent = des;
}

/**
 *
 * @param {string} username username that login with
 * @returns {{code:number;data?:object;message?:string}} zero code means fetch was successfully , otherwise there is an error
 */
async function fetchData(username) {
  try {
    const response = await fetch(`${BASE_URL}/${username}`);
    if (!response.ok) {
      //error
      const msg = (await response.json())?.message;
      throw new Error(msg);
    }
    return { code: 0, data: await response.json() };
  } catch (err) {
    let message = "There was a problem , please try again later";
    return { code: 1, message: err.message || message };
  }
}
/**
 *
 * @param {string} username
 * @returns {null|object}
 */
function readCache(username) {
  const data = localStorage.getItem(username);
  if (!data) return null;
  return JSON.parse(data);
}

/**
 *
 * @param {string} username
 * @param {object} data
 */
function writeCache(username, data) {
  localStorage.setItem(username, JSON.stringify(data));
}
/**
 * trigger when form submit
 * @param {*} e
 * @returns {void}
 */
async function onSubmit(e) {
  // prevent default
  e.preventDefault();

  // hide error
  hideError();

  // username
  const username = formUsername.value?.trim();
  if (!username) return;

  let data, errorMessage;
  // check cache
  data = readCache(username);

  // not in cache
  if (!data) {
    const response = await fetchData(username);
    if (response.code === 0) {
      // successful
      data = response.data;
    } else {
      // error
      errorMessage = response.message;
    }
  }

  if (data) {
    // show data
    setProfile(data);

    // write cache
    writeCache(username, data);
  } else if (errorMessage) showError(errorMessage);
}

form.addEventListener("submit", onSubmit);
