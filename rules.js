class Start extends Scene {
    create() {
        this.engine.setTitle("Title goes here"); // TODO: replace this text using this.engine.storyData to find the story title
        this.engine.addChoice("Begin the story");
    }

    handleChoice() {
        this.engine.gotoScene(Location, "Home"); // TODO: replace this text by the initial location of the story
    }
}

class Location extends Scene {
    create(key) {
        let locationData = undefined; // TODO: use `key` to get the data object for the current story location
        this.engine.show("Body text goes here"); // TODO: replace this text by the Body of the location data
        
        if(true) { // TODO: check if the location has any Choices
            for(let choice of ["example data"]) { // TODO: loop over the location's Choices
                this.engine.addChoice("action text"); // TODO: use the Text of the choice
                // TODO: add a useful second argument to addChoice so that the current code of handleChoice below works
            }
        } else {
            this.engine.addChoice("The end.")
        }
    }

    handleChoice(choice) {
        if(choice) {
            this.engine.show("&gt; "+choice.Text);
            this.engine.gotoScene(Location, choice.Target);
        } else {
            this.engine.gotoScene(End);
        }
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');