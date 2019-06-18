/* Some js just for fun */

// Create the text for background
var txt = "https://www.elbone.com.au/"; // The text to use
txt.split(); // Split into array
  
// Loop over text to add spaces
var txt_now = '';
for (var i = 0; i < txt.length; i++) {
  txt_now += txt[i] + ' ';
}
    
// Repeat a few times to fill up space
var txt_rep = '', l = 0;
while(l < 100) {
  txt_rep += txt_now;
  l++;
}
  
// Apply to body tag using vanilla js
var attribute = document.createAttribute("data-bg");
attribute.nodeValue = txt_rep;
document.body.setAttributeNode(attribute);