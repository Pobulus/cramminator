var questions = [];
var testIndex = 0;

function startTest() {
  questions = questions.sort(() => Math.random() - 0.5);
  testIndex = -1;
  console.log("shuffle:", questions);
  $("#next").prop("disabled", false);
  nextQuestion();
}
function prevQuestion(){
    if (testIndex > 0){
        testIndex -= 2;
        nextQuestion();
    }
}
function nextQuestion() {
  if (testIndex < questions.length) {
    testIndex += 1;
    question = questions[testIndex];
    console.log(question);
    $("#question").text(question.question);
    const answers = question.correct
      .sort(() => Math.random() - 0.5);
      .concat(question.wrong)
      .sort(() => Math.random() - 0.5);
    console.log(answers);
    $("#testBody").empty();
    $("#correctAnswers").text("");
    answers.forEach((ans, index) => {
      $("#testBody").append(
        `<li onclick="ans${index}.click()"><input class="ans" id="ans${index}" type="checkbox" name="${ans}" value="${ans}"><label for="${ans}">${ans}</label></input></li>`
      );
      console.log(ans);
    });
  } else {
    $("#next").prop("disabled", true);
  }
}

async function loadTest(inp) {
  let formData = new FormData();
  var reader = new FileReader();
  let file = inp.files[0];
  reader.addEventListener("load", function () {
    questions = JSON.parse(reader.result);
    console.log("loaded:", questions);
    startTest();
  });
  reader.readAsText(file);
}
function checkTest() {
  const question = questions[testIndex];
  console.log(question);
  $(".ans").each(function (index, value) {
    console.log(this);
    console.log(this.checked);
    if (this.checked && question.correct.includes(this.value)) {
      $(this).parent().css("background", "green");
    } else if (!this.checked && question.wrong.includes(this.value)) {
      $(this).parent().css("background", "green");
    } else {
      $(this).parent().css("background", "red");
    }
  });
  $("#correctAnswers").text(
    `Correct Answers are: ${question.correct.join(", ")}`
  );
}
