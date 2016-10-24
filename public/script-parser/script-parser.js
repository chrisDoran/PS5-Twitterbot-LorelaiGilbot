document.getElementById('file').onchange = function(){
	console.log("get it");

  var file = this.files[0];

  var reader = new FileReader();
  reader.onload = function(progressEvent){
    // Entire file
    console.log(this.result);

    // By lines
    var lines = this.result.split('\n');
    for(var line = 0; line < lines.length; line++){
      console.log(lines[line]);
    }
  };
  reader.readAsText(file);
};

// var rawText = "";

// var series = [episode];

// var episode = { title: "", season: "", episode: "", script: [entry] };

// var stageDirection { TYPE: "SD", text: "" };

// var setting { TYPE: "SE", text:"" };

// var dialogue { TYPE: "DI" character: "", line: "" };

