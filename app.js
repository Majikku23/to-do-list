const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/todolistDB');


const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);


const item = new Item({
    name: "Welcome to my todolist!",
});
const item1 = new Item({
    name: "Hit the + button to add a new item.",
});
const item2 = new Item({
    name: "<== Click this to delete an item.",
});

const defaultItems = [item, item1, item2];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {

    Item.find({}, (err, foundItems) => {

        if(foundItems.length === 0){
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Added default items");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {day: "Today", items: foundItems});
        }
    });

});

app.get("/:customListName", (req, res) => {
    const customListName = req.params.customListName;

    List.findOne({name: customListName}, (err, foundList) => {
        if(!err){
            if(!foundList){
                //create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/"+customListName);
            } else {
                //show a list
                res.render("list", {day: customListName, items: foundList.items})
            }
        }
    });


});



app.post("/", (req, res) => {
    const listName = req.body.button
    const itemName = req.body.newItem


    const item = new Item({
        name: req.body.newItem
    });

    if(listName === "Today"){
        if(item.name != ""){
            item.save();
        }
        res.redirect("/");
    }else{
        List.findOne({name: listName}, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
        })
        res.redirect("/" + listName);
    }
});


app.post("/delete", (req, res) => {
    let id = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndDelete(id, (err) => {
            if(err){
                console.log(err);
            } else {
                console.log("deleted");
            }
        })
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: id}}}, (err, foundList) => {
            if(!err)
            res.redirect("/" + listName);
        })
    }


});




app.listen(3000, function () {
    console.log("Server running at port 3000");
})