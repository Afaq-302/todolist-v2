//jshint esversion:6
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash")

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1:27017/newDB");

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

//Schema for Items
const itemsSchema = { name: String }

//Creating Mongoose model using Item Schema
const Item = mongoose.model("Item", itemsSchema);

//Creating Sample Document
const item1 = new Item({
  name: "This is a Sample Todo!"
});

const defaultItems = [item1];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)


app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Saved to Database!!");
        }
      });

      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  console.log(req.body);

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {

  res.redirect("/");
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  Item.findByIdAndRemove(checkedItemId, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Deleted Successfully!");
    }
  })
});

//for now the customList wil just log the customList Name
app.get("/:customList", function (req, res) {

  const customListName = _.capitalize(req.params.customList);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {

      if (!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName)

      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
      }
    }

  });



  console.log(customListName);

  // res.redirect("/");

});


app.get("/about", function (req, res) {
  res.render("about");
});




app.listen(3000, function () {
  console.log("Server started on port 3000");
});
