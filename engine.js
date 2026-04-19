class Engine {

    static load(...args) {
        window.onload = () => new Engine(...args);
    }

    constructor(firstSceneClass, storyDataUrl) {

        this.firstSceneClass = firstSceneClass;
        this.storyDataUrl = storyDataUrl;

        this.header = document.body.appendChild(document.createElement("h1"));
        this.output = document.body.appendChild(document.createElement("div"));
        this.actionsContainer = document.body.appendChild(document.createElement("div"));

        // Player Status
        this.state = {
            inventory: [],
            flags: {},
            radioStates: {}
        };

        fetch(storyDataUrl).then(
            (response) => response.json()
        ).then(
            (json) => {
                this.storyData = json;
                this.gotoScene(firstSceneClass);
            }
        );
    }

    gotoScene(sceneClass, data) {
        this.scene = new sceneClass(this);
        this.scene.create(data);
    }

    addChoice(action, data) {
        let button = this.actionsContainer.appendChild(document.createElement("button"));
        button.innerText = action;
        button.onclick = () => {
            while (this.actionsContainer.firstChild) {
                this.actionsContainer.removeChild(this.actionsContainer.firstChild);
            }
            this.scene.handleChoice(data);
        }
    }

    setTitle(title) {
        document.title = title;
        this.header.innerText = title;
    }

    show(msg) {
        let div = document.createElement("div");
        div.innerHTML = msg;
        this.output.appendChild(div);
    }

    
    hasItem(itemId) {
        return this.state.inventory.includes(itemId);
    }

    addItem(itemId) {
        if (!this.hasItem(itemId)) {
            this.state.inventory.push(itemId);
        }
    }

    removeItem(itemId){
        let index = this.state.inventory.indexOf(itemId);
        if (index !== -1) {
            this.state.inventory.splice(index, 1);
        }
    }

    hasFlag(flagName) {
        return !!this.state.flags[flagName];
    }

    setFlag(flagName, value = true) {
        this.state.flags[flagName] = value;
    }

    getRadioState(locationKey) {
        if (this.state.radioStates[locationKey] === undefined) {
            this.state.radioStates[locationKey] = 0;
        }
        return this.state.radioStates[locationKey];
    }

    setRadioState(locationKey, value) {
        this.state.radioStates[locationKey] = value;
    }
}

class Scene {
    constructor(engine) {
        this.engine = engine;
    }

    create() { }

    update() { }

    handleChoice(action) {
        console.warn('no choice handler on scene ', this);
    }
}