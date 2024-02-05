var questions = [];
var images = [];
var testIndex = 0;
var files;
var folderName;

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
    $("#question").html(question.question);
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
    answers.forEach((ans, index) => {
      $("#testBody").append(
        `<tr><td onclick="ans${index}.click()"><input class="ans" id="ans${index}" type="checkbox" name="${ans}" value="${ans}"><label for="${ans}">${ans}</label></input></td></tr>`
      );
      console.log(ans);
    });
  } else {
    $("#next").prop("disabled", true);
  }
}

async function loadTest(zip) {
  let file = zip.filter((x) => x.includes(".yml") || x.includes(".yaml"))?.[0];
  let imgs = zip.filter((x) => x.includes(".png"));
  for await (const f of imgs){
  
    await f.async("base64").then(function (data64) {
      var dataURI = "data:image/png;base64," + data64;
      images.push({ name: f.name, dataURI });
    })
  }
 
  await file.async("string").then((result) => {
    questions = jsyaml.load(result);
    console.log("loaded:", questions);

  });
  startTest();
}
function checkTest() {
  const question = questions[testIndex];
  console.log(question);
  $(".ans").each(function (index, value) {
    console.log(this);
    console.log(this.checked);
    if (this.checked && question.correct?.includes(this.value)) {
      $(this).parent().css("background", "green");
    } else if (!this.checked && question.wrong?.includes(this.value)) {
      $(this).parent().css("background", "green");
    } else {
      $(this).parent().css("background", "red");
    }
  });
  $("#correctAnswers").text(
    `Correct Answers are: ${question.correct?.join(", ")}`
  );
}
f.onchange = function () {
  var zip = new JSZip();

  zip.loadAsync(this.files[0] /* = file blob */).then(
    async function (zip) {
      // process ZIP file content here
      console.log(zip);
      files = zip;
      folderName = files.filter(x => x.match(/\/$/))[0]?.name||'';
      await loadTest(zip);
      
      alert("Test loaded successflly!");
    },
    function () {
      alert("Not a valid zip file");
    }
  );
};
