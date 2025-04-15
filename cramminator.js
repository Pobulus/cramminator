var questions = [];
var orderedQuestions = [];
var failedQuestions = [];
var images = [];
var testIndex = 0;
var files;
var folderName;
var hardcore = false;
var retries = 0;
var player = undefined;
var overview = false;
var answersAppearingDelay = 5;

function shuffle(cont) {
  return overview
    ? cont
    : cont
        .sort(() => Math.random() - 0.5)
        .sort(() => Math.random() - 0.5)
        .sort(() => Math.random() - 0.5)
        .sort(() => Math.random() - 0.5);
}
function markCorrect(item) {
  item.css(
    "background",
    overview ? "var(--wrong-color)" : "var(--correct-color)"
  );
}
function markWrong(item) {
  item.css(
    "background",
    overview ? "var(--correct-color)" : "var(--wrong-color)"
  );
}

function renderKaTeX() {
  renderMathInElement(document.body, {
    // customised options
    // • auto-render specific keys, e.g.:
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false },
      { left: "\\[", right: "\\]", display: true },
    ],
    // • rendering keys, e.g.:
    throwOnError: false,
  });
}

function startTest() {
  $(".celebration").hide();
  questions = shuffle(questions);
  testIndex = -1;
  console.log("shuffle:", questions);
  nextQuestion();
}
function prevQuestion() {
  $(".celebration").hide();
  if (testIndex > 0) {
    testIndex -= 2; // okay this has to be fixed some day
    nextQuestion();
  }
}
function nextQuestion() {
  $("#prev").prop("disabled", false);
  if (testIndex === -1) $("#prev").prop("disabled", true);
  $("#next").prop("disabled", false);
  if (testIndex === questions.length) $("#next").prop("disabled", true);
  $("#next").blur(); // unfocus the next button to fix issues with spacebar
  if (testIndex < questions.length - 1) {
    testIndex += 1;
    $("#counter").text(
      `${Math.min(testIndex + 1, questions.length)}/${questions.length}`
    );
    question = questions[testIndex];
    console.log(question);
    $("#question").html(
      question.question?.replaceAll(/\n/g, "<br/>") || "<i>missing question</i>"
    );
    if (question.match) {
      const allAnswers = shuffle(Object.entries(question.match));
      const options = allAnswers
        .map((o) => `<option value="${o[0]}">${o[1]}</option>`)
        .join("\n");
      Object.entries(question.match).forEach((entry) =>
        $("#question").html(
          $("#question")
            .html()
            .replaceAll(
              RegExp(`\\$${entry[0]}`, "g"),
              `<select name="${entry[0]}"><option style="display:none">${options}</select>`
            )
        )
      );
    }
    $("#commentContent").text(question.comment || "");
    $("#question-image-error").text("");
    if (question.image) {
      imageFilename =
        folderName && question.image.includes(folderName)
          ? question.image
          : folderName + question.image;
      let image = images.filter((i) => i.name === imageFilename)?.[0];
      if (image) {
        $("#question-image").attr("src", image.dataURI);
      } else {
        $("#question-image").attr("src", "");
        $("#question-image-error").text(
          `image file: ${imageFilename} was not provided!`
        );
      }
    } else {
      $("#question-image").attr("src", "");
    }

    let answers = [];
    answers = answers.concat(question.correct || []);
    answers = answers.concat(question.wrong || []);

    answers = shuffle(answers);
    console.log(answers);
    $("#testBody").empty();
    $("#correctAnswers").text("");
    $("#explanationContent").text("");
    answers.forEach((ans, index) => {
      $("#testBody").append(
        `<tr>
            <td class="ans" onclick="ans${index}.click()" ${
          ans.includes("\n") ? 'style="text-align:left"' : ""
        }>
              <input class="ans" id="ans${index}" type="checkbox" name="${ans.replaceAll(
          /"/g,
          "&quot;"
        )}" value="${ans.replaceAll(/"/g, "&quot;")}">
          </input>
                <label for="${ans.replaceAll(/"/g, "&quot;")}">${ans.replaceAll(
          /\n/g,
          "<br/>"
        )}</label>
              
            </td>
          </tr>`
      );
      console.log(ans);
      console.log(ans.replaceAll(/"/g, "&quot;"));
    });
    if (question.answer !== undefined) {
      $("#testBody").append(
        `<input id="answer" type="${question.type ?? "text"}"></input>`
      );
    }
  } else {
    if (hardcore) {
      alert("CONGRATULATIONS! You're a real tryhard");
    }
    $(".celebration").show();
    $("#next").prop("disabled", true);
  }
  if (overview) {
    checkTest();
  }
  renderKaTeX();
}

function loadQuestionsFile(text) {
  try {
    questions = jsyaml.load(text);
    orderedQuestions = jsyaml.load(text);
    localStorage.removeItem("savedQuestions");
    localStorage.setItem("savedQuestions", JSON.stringify(questions));
    console.log("loaded:", questions);
    alert("Test loaded successfully!");
  } catch (ex) {
    alert(ex);
  }
}
async function chooseFile(list) {
  $("#fileList").empty();
  list.forEach((x) => {
    const filename = x.name.split("/").slice(1).join("/");
    $("#fileList").append(`<li>${filename}</li>`);
    $("#fileList li")
      .last()
      .click(async function () {
        await x.async("string").then((result) => loadQuestionsFile(result));
        startTest();
        $("#filePrompt").hide();
        $("#loadedName").text(filename);
      });
  });
  $("#filePrompt").show();
}

async function loadTest(zip) {
  let fileList = zip.filter((x) => x.includes(".yml") || x.includes(".yaml"));
  console.log("files:", fileList);

  let imgs = zip.filter((x) => x.includes(".png"));

  for await (const f of imgs) {
    await f.async("base64").then(function (data64) {
      var dataURI = "data:image/png;base64," + data64;
      images.push({ name: f.name, dataURI });
    });
  }
  localStorage.removeItem("savedImages");
  localStorage.setItem("savedImages", JSON.stringify(images));
  if (fileList.length === 0) {
    alert("Missing a yaml file!");
    return "Missing a yaml file!";
  }
  if (fileList.length === 1) {
    await fileList[0]
      .async("string")
      .then((result) => loadQuestionsFile(result));
    startTest();
    $("#loadedName").text(fileList[0].name.split("/").slice(1).join("/"));
  } else {
    chooseFile(fileList);
  }
  // player?.loadVideoById("GLm_gDsm1ZI");
  return "Test loaded successfully!";
}

function answersToMatch(match) {
  const selects = [];
  $("select").each(function (i) {
    selects.push($(this)[0]);
  });

  return (
    "<br/>" +
    selects
      .map((s) => `${match?.[s.value] || ""} -> ${match?.[s.name]}`)
      .join("<br/>")
  );
}
function checkTest() {
  const question = questions[testIndex];
  console.log(question);
  let allOK = true;
  $("input.ans").each(function (index, value) {
    console.log(this);
    console.log(this.checked);
    if (this.checked && question.correct?.includes(this.value)) {
      markCorrect($(this).parent());
    } else if (!this.checked && question.wrong?.includes(this.value)) {
      markCorrect($(this).parent());
    } else {
      markWrong($(this).parent());
      allOK = false;
    }
  });
  $("select").each(function (i) {
    if ($(this)[0].value === $(this)[0].name) {
      markCorrect($(this));
    } else {
      markWrong($(this));
      allOK = false;
    }
  });
  $("#answer").each(function (i) {
    const fuseOptions = {
      // isCaseSensitive: false,
      // includeScore: false,
      // shouldSort: true,
      // includeMatches: false,
      // findAllMatches: false,
      minMatchCharLength: 3,
      // location: 0,
      threshold: 0.2,
      distance: 2,
      // useExtendedSearch: false,
      // ignoreLocation: false,
      // ignoreFieldNorm: false,
      // fieldNormWeight: 1,
    };

    const fuse = new Fuse([String(question.answer)], fuseOptions);
    console.log("fuse", fuse.search(String($(this)[0].value)));

    // loose type comparison
    if (
      $(this)[0].value == question.answer ||
      (question.type === "text" && fuse.search($(this)[0].value).length)
    ) {
      markCorrect($(this));
    } else {
      markWrong($(this));
      allOK = false;
    }
  });
  $("#correctAnswers").html(
    `Correct Answers are: ${
      question.correct?.join(", ") || answersToMatch(question.match) || ""
    } ${question.answer ?? ""}`
  );
  $("#explanationContent").html(
    question.explanation?.replaceAll(/\n/g, "<br/>") || ""
  );
  if (!allOK) {
    failedQuestions.push(question);
    if (hardcore) {
      // one mistake resets the test
      retries += 1;
      $("#retries-counter").text(`retries: ${retries}`);
      testIndex = -1;
      player?.seekTo(0);
      nextQuestion();
    }
  }
  renderKaTeX();
}
f.onchange = function () {
  var zip = new JSZip();

  zip.loadAsync(this.files[0] /* = file blob */).then(
    async function (zip) {
      // process ZIP file content here
      console.log(zip);
      files = zip;
      folderName = files.filter((x) => x.match(/\/$/))[0]?.name || "";
      localStorage.setItem("savedFolderName", folderName);
      console.log(await loadTest(zip));
    },
    function () {
      alert("Not a valid zip file");
    }
  );
};

function toggleHardcore() {
  hardcore = !hardcore;
  $("#hardcoreToggle").html(`Hardcore?<b> ${hardcore ? "Yes" : "No"}</b>`);
  if (hardcore) {
    $("#hardcoreBox").addClass("hardcore");
  } else {
    $("#hardcoreBox").removeClass("hardcore");
  }
}
function toggleOverview() {
  overview = !overview;
  if(hardcore) toggleHardcore();
  $("#overviewToggle").html(`Overview?<b> ${overview ? "Yes" : "No"}</b>`);
  if (overview) {
    $("#overviewBox").addClass("hardcore");
  } else {
    $("#overviewBox").removeClass("hardcore");
  }
  questions = [...orderedQuestions];
  startTest();
}
// stuff related to the bgm player
function bindPlayer(p) {
  player = p;
}
var tag = document.createElement("script");

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function loadPlayerWithSoundtrack() {
  player = new YT.Player("player", {
    height: "150",
    width: "320",
    videoId: $("#soundtrack-input").val().split("v=")?.[1],
    playerVars: {
      playsinline: 1,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}
function onPlayerReady(event) {}

function onPlayerStateChange(event) {}
function stopVideo() {
  player.stopVideo();
}
function initiateCramminator() {
  // load saved questions
  orderedQuestions = JSON.parse(localStorage.getItem("savedQuestions"));
  questions = [...orderedQuestions];
  images = JSON.parse(localStorage.getItem("savedImages")) || [];
  folderName = localStorage.getItem("savedFolderName");
  console.log("loaded saved file: ", questions);
  if (questions) {
    startTest();
    $("#loadedName").text("saved file");
  }
  // add keyboard support
  document.addEventListener("keydown", function (event) {
    if (event.key == "ArrowLeft") {
      if (questions) prevQuestion();
    } else if (event.key == "ArrowRight") {
      if (questions) nextQuestion();
    } else if (event.key == "Enter") {
      if (questions) checkTest();
    } else {
      const number = Number(event.key);
      if (number != NaN) {
        const answers = $("td.ans");
        let index = number !== 0 ? number - 1 : 9;
        index += event.getModifierState("CapsLock") * 10;
        console.log(index);
        answers?.[`${index}`]?.click();
      }
    }
  });
}
function reviewFailed() {
  if(overview) return;
  if (!failedQuestions.length) {
    alert("You haven't failed a single question yet");
    return;
  }
  questions = failedQuestions;
  failedQuestions = [];
  startTest();
}

window.onload = initiateCramminator;
