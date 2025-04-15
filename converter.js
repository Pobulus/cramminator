var file;
var objs;
var customTransform;
var output = {}
f.onchange = function () {
    console.log(this.files)
    file = this.files?.[0];
    if(!file) return alert('No file');
    if(!file.type === 'text/csv') return alert('Only csv supported');
    file.text().then(text => parseCSV(text));
  };

function parseCSV(raw) {
  objs = $.csv.toObjects(raw);
  const head = Object.keys(objs?.[0] || {});
  $('#questionM').empty();
  $('#answerM').empty();

  head.forEach(key => $('#questionM').append(`<option value="${key}">${key}</option>`))
  head.forEach(key => $('#answerM').append(`<option value="${key}">${key}</option>`))

}
function generateTest() {
  const transform = $('#transform').val()
  if(transform) {
    eval('customTransform = '+transform)
  }
  const mapping = {question: $('#questionM').val(), answer: $('#answerM').val(), }
  const output = {};
  output.name = $('#name').val();
  output.soundtrack = $('#soundtrack').val();
  output.style = jsyaml.load($('#style').val());
  output.rules = jsyaml.load($('#rules').val());
  output.symbols = jsyaml.load($('#symbols').val());
  output.questions = customTransform 
    ? objs.map(customTransform)
    : objs.map(obj => ({question: obj[mapping.question], answer: obj[mapping.answer]}))
  return output;
}

 

window.onload = () => {
  var zip = new JSZip();
  
  $("#blob").on("click", function () {
        zip.file(`${output.name || 'test'}.yaml`, jsyaml.dump(generateTest()));
        zip.generateAsync({type:"blob"}).then(function (blob) { // 1) generate the zip file
            saveAs(blob, `${output.name || 'test'}.zip`);                          // 2) trigger the download
        }, function (err) {
            $("#blob").text(err);
        });
    });
    
}



