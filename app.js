//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-abhipsa:test789@cluster0.aupmv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority/todolistDB", {useNewUrlParser:true});


//mongoose schema
//const <schemaName>= {
  //<fieldName>: <FieldDataType>,
//}

const itemsSchema = {
  name: String
};

//Mongoose model
//const=mongoose.model(
//<"SingularCollectionName">,
//<schemaName>);
const Item = mongoose.model("Item", itemsSchema);

//mongoose document
//const <constantName> = new <Modelname> ({
//<fieldName>: <fieldData>,
//});
const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name:"Hit the + to add a new item."
});

const item3 = new Item({
  name:"<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
const listSchema = {
  name: String,
  items:[itemsSchema]
};

const List = mongoose.model("List", listSchema);
//Mongoose insertMany()
//<ModelName>.insertMany(<documentArray>, function(err)){
 // deal with error or log success
//});


// Item.insertMany(defaultItems, function(err){
//   if (err){
//     console.log(err);
//   }else{
//     console.log("Successfully saved changes to DB.");
//   }
  
// });

app.get("/", function(req, res) {



Item.find({},function(err, foundItems){

  if (foundItems.length===0) {
    Item.insertMany(defaultItems, function(err){
  if (err){
    console.log(err);
  }else{
    console.log("Successfully saved changes to DB.");
  }
  
});
res.redirect("/");   //to redirect to the root rout ie, to render the items that were just added
  }
  // console.log(foundItems);
  else{

   res.render("list", {listTitle:"Today", newListItems: foundItems});
  }

});

// const day = date.getDate();

 
});


//dynamic route for customlist
app.get("/:customListName", function(req, res){
  // console.log(req.params.customListName);
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
       // console.log("Doesn't exist");  create a new list
         const list = new List({
    name: customListName,
    items: defaultItems
  });
    list.save();
    res.redirect("/" + customListName);



      }else{
       // console.log("Exists");    show an existing list
       res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });



  const list = new List({
    name: customListName,
    items: defaultItems
  });

  list.save();




});

app.post("/", function(req, res){
 const itemName = req.body.newItem;
 const listName = req.body.list;

 const item = new Item({
  name: itemName
 });

if(listName==="Today"){

 item.save();
 res.redirect("/");
}else{
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+ listName);
  });
}



  // const item = req.body.newItem;

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res){
  // console.log(req.body.checkbox);
  const checkedItemId = req.body.checkbox ;
  const listName = req.body.listName;

//mongoose findByIdAndRemove(<Id>, function(err){
//  handle any error or log success
//});
if(listName=="Today"){


Item.findByIdAndRemove(checkedItemId, function(err){
  if(!err){
    console.log("Successfully deleted checked items");
    res.redirect("/");
  }
});

}else{
  List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedItemId}}}, function(err, foundList){
   if(!err){
    res.redirect("/" + listName );

   }
});
}





});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});              {to use dynamic route using express}
// });








app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}







app.listen(port, function() {
  console.log("Server started on port 3000");
});
