async function getJSON(url) {
  const response = await fetch(url);
  return response.json();
}

async function getID(name, id, div) {
  if (!name && !id) {
    return null;
  } else if (!id) {
    const results = await getJSON(
      `https://www.elevenvr.club/accounts/search/${encodeURIComponent(name)}`
    );
    for (const user of results.data) {
      if (user["attributes"]["user-name"] === name) {
        return user["id"];
      }
    }
    const message = document.createTextNode("No matching name found!");
    div.appendChild(message);
    return null;
  } else {
    const check = await fetch(`https://www.elevenvr.club/accounts/${id}`);
    if (check.status === 404) {
      const message = document.createTextNode("No matching ID found!");
      div.appendChild(message);
      return null;
    }
    return id;
  }
}

async function collectStats() {
  const div = document.getElementById("stats");
  div.innerHTML = "";
  const form = document.querySelector("form");
  const data = Object.fromEntries(new FormData(form).entries());
  const id = await getID(data["name"], data["id"], div);
  if (!id) {
    return;
  }
  var count = 1;
  const counter = document.createTextNode("Collecting match data...");
  div.appendChild(counter);
  const matches = [];
  const rounds = [];
  var nexturl = `https://www.elevenvr.club/accounts/${id}/matches`;
  while (nexturl) {
    counter.textContent = `Collecting match data: Page ${count}`;
    count++;
    const currentMatchData = await getJSON(nexturl);
    matches.push(...currentMatchData["data"]);
    rounds.push(...currentMatchData["included"]);
    nexturl = currentMatchData["links"]["next"];
    console.log(matches);
    console.log(rounds);
  }
  counter.textContent = "Matches collected, calculating statistics...";
  return {
      matches, rounds
  }
}
