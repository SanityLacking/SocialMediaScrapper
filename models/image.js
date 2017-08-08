/*******************************
 *     Image Model File
 *  This file contains the model for the Images. 
 *  Each image contains member variables and member functions that perform functions specific to the class.
 *  JavaScript does not have strict Classes like Java or other OOP languages but operates on Prototypes
 * 
 * 
 ******************************/

function Image(id, title, caption = null, fname) {
 // Member Variables ===============================================================
 this.id = id; // Maintain an ID for the image. Might be useful later on
 this.title = title; // Title for an image
 if (caption === null) // Caption for an image -- default is the title
  this.caption = title;
 else
  this.caption = caption;
 this.directory = "assets/photos"; // Where the photos are stored. Change this if the directory changes
 this.fname = fname; // The actual file name of the image


 // Member Functions ===============================================================

 // This function just generates the relative directory for the image... just an example of a prototype function
 this.URL = function() {
  return this.directory + "/" + this.fname;
 }
}