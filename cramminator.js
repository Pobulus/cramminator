var questions = [];
var failedQuestions =[];
var images = [];
var testIndex = 0;
var files;
var folderName;
var hardcore = false;
var retries = 0;
var player = undefined;
var answersAppearingDelay = 5;

function startTest() {
  $('.celebration').hide();
  questions = questions
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5);
  testIndex = -1;
  console.log("shuffle:", questions);
  
  nextQuestion();
  
}
function prevQuestion() {
  
  $('.celebration').hide();
  if (testIndex > 0) {
    testIndex -= 2; // okay this has to be fixed some day
    nextQuestion();
  
  }
}
function nextQuestion() {
  $("#prev").prop("disabled", false);
  if(testIndex === -1) $("#prev").prop("disabled", true);
  $("#next").prop("disabled", false);
  if(testIndex === questions.length) $("#next").prop("disabled", true);
  $('#next').blur(); // unfocus the next button to fix issues with spacebar
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
      const allAnswers = Object.entries(question.match).sort(
        () => Math.random() - 0.5
      );
      const options = allAnswers
        .map((o) => `<option value="${o[0]}">${o[1]}</option>`)
        .join("\n");
      Object.entries(question.match).forEach((entry) =>
        $("#question").html(
          $("#question")
            .html()
            .replaceAll(
              RegExp(`\\$${entry[0]}`, 'g'),
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

    answers = answers
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5);
    console.log(answers);
    $("#testBody").empty();
    $("#correctAnswers").text("");
    $("#explanationContent").text("");
    answers.forEach((ans, index) => {
      setTimeout(() => {
        $("#testBody").append(
          `<tr>
            <td class="ans" onclick="ans${index}.click()" ${
            ans.includes("\n") ? 'style="text-align:left"' : ""
          }>
              <input class="ans" id="ans${index}" type="checkbox" name="${ans.replaceAll(/"/g, '&quot;')}" value="${ans.replaceAll(/"/g, '&quot;')}">
                <label for="${ans.replaceAll(/"/g, '&quot;')}">${ans.replaceAll(/\n/g, "<br/>")}</label>
              </input>
            </td>
          </tr>`
        );
  
        console.log(ans);
        console.log(ans.replaceAll(/"/g, '&quot;'));
      }, index*answersAppearingDelay)}
    );
  } else {
    if (hardcore) {
      alert("CONGRATULATIONS! You're a real tryhard");
    }
    $('.celebration').show();
    $("#next").prop("disabled", true);
  }
}

function loadQuestionsFile(text) {
  questions = jsyaml.load(text);
  localStorage.setItem("savedQuestions", JSON.stringify(questions));
  console.log("loaded:", questions);
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
        alert(`${filename} loaded successfully!`);
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
    alert(`${fileList[0].name} loaded successfully!`);
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
  
  return '<br/>'+selects.map(s => `${match?.[s.value]||''} -> ${match?.[s.name]}`).join('<br/>');
}
function checkTest() {
  const question = questions[testIndex];
  console.log(question);
  let allOK = true;
  $("input.ans").each(function (index, value) {
    console.log(this);
    console.log(this.checked);
    if (this.checked && question.correct?.includes(this.value)) {
      $(this).parent().css("background", "var(--correct-color)");
    } else if (!this.checked && question.wrong?.includes(this.value)) {
      $(this).parent().css("background", "var(--correct-color)");
    } else {
      $(this).parent().css("background", "var(--wrong-color)");
      allOK = false;
    }
  });
  $("select").each(function (i) {
    if ($(this)[0].value === $(this)[0].name) {
      $(this).css("background", "var(--correct-color)");
    } else {
      $(this).css("background", "var(--wrong-color)");
      allOK = false;
    }
  });

  $("#correctAnswers").html(
    `Correct Answers are: ${
      question.correct?.join(", ") || answersToMatch(question.match) || ''
    }`
  );
  $("#explanationContent").text(question.explanation || "");
  if(!allOK){
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
    questions = JSON.parse(localStorage.getItem("savedQuestions"));
    images = JSON.parse(localStorage.getItem("savedImages")) || [];
    folderName = localStorage.getItem("savedFolderName");
    console.log("loaded saved file: ", questions);
    if (questions) {
      startTest();
      $("#loadedName").text("saved file");
    }
    // add keyboard support
    document.addEventListener('keydown', function(event) {
      if(event.key == 'ArrowLeft') {
        if(questions) prevQuestion();
      }
      else if(event.key == 'ArrowRight') {
        if(questions) nextQuestion();
      }
      else if(event.key == ' ') {
        if(questions) checkTest();
      }
      else {
        const number = Number(event.key);
        if(number != NaN){
          const answers  = $('td.ans');
          let index = number!==0 ? number-1 : 9;
          index += event.getModifierState('CapsLock')*10;
          console.log(index);
          answers?.[`${index}`]?.click();
        }
      }
  });
}
function reviewFailed() {
  if(!failedQuestions.length) {
    alert("You haven't failed a single question yet");
    return;
  }
  questions = failedQuestions;
  failedQuestions = [];
  startTest();
}

window.onload = initiateCramminator;