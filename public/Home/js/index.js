"use strict";
var song = null,
  coronaDisplay = document.getElementById("corona"),
  xhr = new XMLHttpRequest(),
  request = new XMLHttpRequest(),
  lastfm = {
    url: "https://ws.audioscrobbler.com/2.0/",
    user: "darkfrc",
    apiKey: "dc63aa42c6245c19fcbd9a051eb39800",
    recent: "user.getrecenttracks",
    top: "user.gettopartists",
    topPeriod: "1month",
    topAmount: 3,
    fetchInterval: 7e3,
  },
  fadeIn = function () {
    document.getElementById("last").setAttribute("style", "display: inherit;");
  },
  renderCurrent = function (t) {
    var e = t.recenttracks.track[0].name,
      a = t.recenttracks.track[0].artist["#text"],
      n = t.recenttracks.track[0].album["#text"],
      f = t.recenttracks.track[0].image[2]["#text"],
      r = "" === n.trim() ? "SoundCloud" : '"'.concat(n, '"'),
      o = encodeURIComponent("".concat(a, " - ").concat(e)),
      c = t.recenttracks.track[0].url,
      s = document.createElement("a");
    (s.innerText = "".concat(a, " - ").concat(e)),
      (s.href = c),
      (document.getElementById("track").innerHTML = "Artist - Song: "),
      (document.getElementById("album").innerHTML = "Album: <a>".concat(
        r,
        "</a>"
      )),
      (document.getElementById("cover").src = f),
      (document.getElementById("coverContainer").href = c);
    document.getElementById("track").appendChild(s), fadeIn();
  },
  renderTop = function (t) {
    for (var e = "", a = 0; a < lastfm.topAmount; a += 1) {
      var n = a === lastfm.topAmount - 1 ? "" : ", ";
      (e += "<strong>"
        .concat(t.topartists.artist[a].name, "</strong>")
        .concat(n)),
        a === lastfm.topAmount - 1 &&
          ((document.getElementById("track").innerHTML =
            "Artist - Song: <a>Nothing playing</a>"),
          (document.getElementById("album").innerHTML = "Artists: <em>".concat(
            e,
            "</em>"
          )));
    }
  },
  xhrGet = function (t, e) {
    xhr.open("GET", t),
      xhr.send(),
      (xhr.onload = function () {
        200 === xhr.status && e(JSON.parse(xhr.response));
      });
  },
  renderLastfm = function () {
    xhrGet(
      ""
        .concat(lastfm.url, "?method=")
        .concat(lastfm.recent, "&user=")
        .concat(lastfm.user, "&api_key=")
        .concat(lastfm.apiKey, "&format=json"),
      function (t) {
        void 0 !== t.recenttracks.track[0]["@attr"]
          ? renderCurrent(t)
          : xhrGet(
              ""
                .concat(lastfm.url, "?method=")
                .concat(lastfm.top, "&user=")
                .concat(lastfm.user, "&api_key=")
                .concat(lastfm.apiKey, "&format=json&period=")
                .concat(lastfm.topPeriod),
              function (t) {
                renderTop(t);
              }
            );
      }
    );
  };

renderLastfm(), setInterval(renderLastfm, lastfm.fetchInterval);
