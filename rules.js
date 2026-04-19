class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title);
        this.engine.show("You wake up cold and wet near an abandoned seaside research station.");
        this.engine.show("Your boat is gone, so the only way to survive may be to explore the station and find a way to call for help.");
        this.engine.addChoice("Begin the story");
    }

    handleChoice() {
        let firstLocation = this.engine.storyData.InitialLocation;
        let firstData = this.engine.storyData.Locations[firstLocation];

        if (firstData.SceneType === "RadioRoom") {
            this.engine.gotoScene(RadioRoom, firstLocation);
        } else {
            this.engine.gotoScene(Location, firstLocation);
        }
    }
}

class Location extends Scene {
    create(key) {
        this.key = key;
        let locationData = this.engine.storyData.Locations[key];

        this.engine.show("<hr>");
        this.engine.show("<strong>" + key + "</strong>");
        this.engine.show(locationData.Body);

        // show inventory
        if (this.engine.state.inventory.length > 0) {
            this.engine.show("<em>Inventory: " + this.engine.state.inventory.join(", ") + "</em>");
        }

        // item choices
        if (locationData.Items) {
            for (let i = 0; i < locationData.Items.length; i++) {
                let item = locationData.Items[i];

                if (!this.engine.hasItem(item.Id)) {
                    this.engine.addChoice("Take " + item.Name, {
                        Type: "TakeItem",
                        Item: item,
                        CurrentLocation: key
                    });
                }
            }
        }

        // fuse box choice
        if (locationData.FuseBox) {
            if (!this.engine.hasFlag(locationData.FuseBox.SetsFlag)){
                this.engine.addChoice("Install the replacement fuse", {
                    Type: "UseFuse",
                    FuseBox: locationData.FuseBox,
                    CurrentLocation: key
                });
            } else {
                this.engine.show("You already installed the fuse. There is no need to do that again.");
            }
        }

        // movement choices
        if (locationData.Choices && locationData.Choices.length > 0) {
            for (let i = 0; i < locationData.Choices.length; i++) {
                let choice = locationData.Choices[i];
                this.engine.addChoice(choice.Text, {
                    Type: "Move",
                    Choice: choice,
                    CurrentLocation: key
                });
            }
        } else {
            this.engine.addChoice("The end.");
        }
    }

    handleChoice(action) {
        if (!action) {
            this.engine.gotoScene(End);
            return;
        }

        // take item
        if (action.Type === "TakeItem") {
            let item = action.Item;
            this.engine.addItem(item.Id);
            this.engine.show("&gt; Take " + item.Name);
            this.engine.show(item.PickupText);

            let locationData = this.engine.storyData.Locations[action.CurrentLocation];
            if (locationData.SceneType === "RadioRoom") {
                this.engine.gotoScene(RadioRoom, action.CurrentLocation);
            } else {
                this.engine.gotoScene(Location, action.CurrentLocation);
            }
            return;
        }

        // use fuse
        if (action.Type === "UseFuse") {
            let fuseBox = action.FuseBox;

            this.engine.show("&gt; Install the replacement fuse");

            if (this.engine.hasFlag(fuseBox.SetsFlag)) {
                this.engine.show(fuseBox.AlreadyDoneText);
            } else if (this.engine.hasItem(fuseBox.RequiredItem)) {
                this.engine.setFlag(fuseBox.SetsFlag, true);
                this.engine.removeItem(fuseBox.RequiredItem);
                this.engine.show(fuseBox.SuccessText);
            } else {
                this.engine.show(fuseBox.MissingItemText);
            }

            let locationData = this.engine.storyData.Locations[action.CurrentLocation];
            if (locationData.SceneType === "RadioRoom") {
                this.engine.gotoScene(RadioRoom, action.CurrentLocation);
            } else {
                this.engine.gotoScene(Location, action.CurrentLocation);
            }
            return;
        }

        // move
        if (action.Type === "Move") {
            let choice = action.Choice;
            this.engine.show("&gt; " + choice.Text);

            if (choice.RequiresFlag) {
                if (!this.engine.hasFlag(choice.RequiresFlag)) {
                    this.engine.show(choice.LockedText);
                    let currentData = this.engine.storyData.Locations[action.CurrentLocation];

                    if (currentData.SceneType === "RadioRoom") {
                        this.engine.gotoScene(RadioRoom, action.CurrentLocation);
                    } else {
                        this.engine.gotoScene(Location, action.CurrentLocation);
                    }
                    return;
                }
            }

            let nextLocation = choice.Target;
            let nextData = this.engine.storyData.Locations[nextLocation];

            if (nextData.SceneType === "RadioRoom") {
                this.engine.gotoScene(RadioRoom, nextLocation);
            } else {
                this.engine.gotoScene(Location, nextLocation);
            }
            return;
        }
    }
}

class RadioRoom extends Scene {
    create(key) {
        this.key = key;
        let locationData = this.engine.storyData.Locations[key];

        this.engine.show("<hr>");
        this.engine.show("<strong>" + key + "</strong>");
        this.engine.show(locationData.Body);

        let currentState = this.engine.getRadioState(key);
        this.engine.show("<em>Radio status: " + locationData.RadioStates[currentState].Label + "</em>");
        this.engine.show(locationData.RadioStates[currentState].Message);

        if (this.engine.state.inventory.length > 0) {
            this.engine.show("<em>Inventory: " + this.engine.state.inventory.join(", ") + "</em>");
        }

        this.engine.addChoice("Turn the radio dial", {
            Type: "TurnRadio",
            CurrentLocation: key
        });

        if (locationData.Choices && locationData.Choices.length > 0) {
            for (let i = 0; i < locationData.Choices.length; i++) {
                let choice = locationData.Choices[i];
                this.engine.addChoice(choice.Text, {
                    Type: "Move",
                    Choice: choice,
                    CurrentLocation: key
                });
            }
        } else {
            this.engine.addChoice("The end.");
        }
    }

    handleChoice(action) {
        if (!action) {
            this.engine.gotoScene(End);
            return;
        }

        if (action.Type === "TurnRadio") {
            let locationKey = action.CurrentLocation;
            let locationData = this.engine.storyData.Locations[locationKey];

            let currentState = this.engine.getRadioState(locationKey);
            let nextState = currentState + 1;

            if (nextState >= locationData.RadioStates.length) {
                nextState = 0;
            }

            this.engine.setRadioState(locationKey, nextState);
            this.engine.show("&gt; Turn the radio dial");
            this.engine.show("The radio crackles and changes to another signal.");

            this.engine.gotoScene(RadioRoom, locationKey);
            return;
        }

        if (action.Type === "Move") {
            let choice = action.Choice;
            this.engine.show("&gt; " + choice.Text);

            if (choice.RequiresFlag) {
                if (!this.engine.hasFlag(choice.RequiresFlag)) {
                    this.engine.show(choice.LockedText);
                    this.engine.gotoScene(RadioRoom, action.CurrentLocation);
                    return;
                }
            }

            let nextLocation = choice.Target;
            let nextData = this.engine.storyData.Locations[nextLocation];

            if (nextData.SceneType === "RadioRoom") {
                this.engine.gotoScene(RadioRoom, nextLocation);
            } else {
                this.engine.gotoScene(Location, nextLocation);
            }
            return;
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