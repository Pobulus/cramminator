var questions = [];
var images = [];
var testIndex = 0;
var files;
var folderName;
var hardcore = false;
var retries = 0;
var player = undefined;

function startTest() {
  questions = questions
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5);
  testIndex = -1;
  console.log("shuffle:", questions);
  $("#next").prop("disabled", false);
  nextQuestion();
}
function prevQuestion() {
  if (testIndex > 0) {
    testIndex -= 2;
    nextQuestion();
  }
}
function nextQuestion() {
  if (testIndex < questions.length) {
    testIndex += 1;
    $("#counter").text(
      `${Math.min(testIndex + 1, questions.length)}/${questions.length}`
    );
    question = questions[testIndex];
    console.log(question);
    $("#question").html(question.question?.replaceAll(/\n/g, '<br/>')||"<i>missing question</i>");
    $('#commentContent').text(question.comment || '');
    $("#question-image-error").text("");
    if (question.image) {
      imageFilename = (folderName && question.image.includes(folderName)) ? question.image : folderName + question.image;
      let image = images.filter((i) => i.name === imageFilename)?.[0];
      if (image) {
        $("#question-image").attr("src", image.dataURI);
      } else {
        $("#question-image").attr("src", '');
        $("#question-image-error").text(
          `image file: ${imageFilename} was not provided!`
        );
      }
    } else {
      $("#question-image").attr("src", "");
    }
    let answers = [];
    answers = answers.concat(question.correct||[])
    answers = answers.concat(question.wrong||[]);

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
    $('#explanationContent').text('');
    answers.forEach((ans, index) => {
      $("#testBody").append(
        `<tr>
          <td onclick="ans${index}.click()" ${ans.includes('\n') ? 'style="text-align:left"':''}>
            <input class="ans" id="ans${index}" type="checkbox" name="${ans}" value="${ans}">
              <label for="${ans}">${ans.replaceAll(/\n/g, '<br/>')}</label>
            </input>
          </td>
        </tr>`
      );
      console.log(ans);
    });
  } else {
    if (hardcore) { alert("CONGRATULATIONS! You're a real tryhard") }
    $("#next").prop("disabled", true);
  }
}


function loadQuestionsFile(text) {
  questions = jsyaml.load(text);
  localStorage.setItem("savedQuestions", JSON.stringify(questions));
  console.log("loaded:", questions);
}
async function chooseFile(list){
  $('#fileList').empty();
  list.forEach((x) => {
    const filename = x.name.split('/').slice(1).join('/');
    $('#fileList').append(`<li>${filename}</li>`);
    $('#fileList li').last().click(async function () {
      await x.async("string").then((result) => loadQuestionsFile(result));
      startTest();
      $('#filePrompt').hide();   
      alert(`${filename} loaded successfully!`);  
      $('#loadedName').text(filename);
    })
  });
  $('#filePrompt').show();
}

async function loadTest(zip) {
  let fileList = zip.filter((x) => x.includes(".yml") || x.includes(".yaml"));
  console.log('files:', fileList);
  
  let imgs = zip.filter((x) => x.includes(".png"));
  for await (const f of imgs){
  
    await f.async("base64").then(function (data64) {
      var dataURI = "data:image/png;base64," + data64;
      images.push({ name: f.name, dataURI });
    })
  }
  if(fileList.length === 0){
    alert("Missing a yaml file!");
    return "Missing a yaml file!";
  } 
  if(fileList.length === 1){
    await fileList[0].async("string").then((result) => loadQuestionsFile(result));
    startTest();
    alert(`${fileList[0].name} loaded successfully!`);
    $('#loadedName').text(fileList[0].name.split('/').slice(1).join('/'));
  } else {
    chooseFile(fileList);
  }
  // player?.loadVideoById("GLm_gDsm1ZI");
  return "Test loaded successfully!"
}
function checkTest() {
  const question = questions[testIndex];
  console.log(question);
  let allOK = true;
  $(".ans").each(function (index, value) {
    console.log(this);
    console.log(this.checked);
    if (this.checked && question.correct?.includes(this.value)) {
      $(this).parent().css("background", "green");
    } else if (!this.checked && question.wrong?.includes(this.value)) {
      $(this).parent().css("background", "green");
    } else {
      $(this).parent().css("background", "red");
      allOK = false;
    }
  });
  $("#correctAnswers").text(
    `Correct Answers are: ${question.correct?.join(", ")}`
  );
  $('#explanationContent').text(question.explanation || '');
  if(hardcore&&!allOK){ // one mistake resets the test
    retries += 1;
    $("#retries-counter").text(`retries: ${retries}`);
    testIndex = -1;

    player?.seekTo(0);
    nextQuestion();
  }
}
f.onchange = function () {
  var zip = new JSZip();

  zip.loadAsync(this.files[0] /* = file blob */).then(
    async function (zip) {
      // process ZIP file content here
      console.log(zip);
      files = zip;
      folderName = files.filter(x => x.match(/\/$/))[0]?.name||'';
      console.log(await loadTest(zip));
      
      
    },
    function () {
      alert("Not a valid zip file");
    }
  );
};

function toggleHardcore(){
  hardcore = !hardcore;
  $('#hardcoreToggle').html(`Hardcore?<b> ${hardcore?'Yes':'No'}</b>`);
  if(hardcore) {
    $("#hardcoreBox").addClass("hardcore");
  } else {
    $("#hardcoreBox").removeClass("hardcore");
  }
}
function bindPlayer(p){
  player = p
}


      // 2. This code loads the IFrame Player API code asynchronously.
      var tag = document.createElement('script');

      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // 3. This function creates an <iframe> (and YouTube player)
      //    after the API code downloads.
      function loadPlayerWithSoundtrack() {
        player = new YT.Player('player', {
          height: '150',
          width: '320',
          videoId: $('#soundtrack-input').val().split('v=')?.[1],
          playerVars: {
            'playsinline': 1
          },
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      }

      // 4. The API will call this function when the video player is ready.
      function onPlayerReady(event) {
        //event.target.playVideo();
      }

      // 5. The API calls this function when the player's state changes.
      //    The function indicates that when playing a video (state=1),
      //    the player should play for six seconds and then stop.
      // var done = false;
      function onPlayerStateChange(event) {
        // if (event.data == YT.PlayerState.PLAYING && !done) {
        //   setTimeout(stopVideo, 6000);
        //   done = true;
        // }
      }
      function stopVideo() {
        player.stopVideo();
      }
function loadSavedQuestions() {
  questions = JSON.parse(localStorage.getItem("savedQuestions")); 
  console.log('loaded saved file: ', questions);
  if(questions) {
    startTest();
    $('#loadedName').text('saved file')
  }
}
window.onload = loadSavedQuestions;
