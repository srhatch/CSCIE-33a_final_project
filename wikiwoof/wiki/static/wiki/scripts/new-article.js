(() => {
    function createElement(type, attrs, parent, text) {
        try {
            const newEl = document.createElement(type);
            for (let attr in attrs) {
                newEl.setAttribute(attr, attrs[attr]);
            }
            if (text) {
                newEl.textContent = text;
            }
            parent.appendChild(newEl);
            return newEl;
        } catch (err) {
            console.error(err);
        }
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        createArticle();
    })
    
    function createArticle() {
        // Adds event listeners to the buttons
        // allowing a user to add and remove steps and materials. 
        const addStep = document.querySelector('.new-article_add-step');
        const removeStep = document.querySelector('.new-article_remove-step');
        removeStep.style.display = 'none';
        const stepsContainer = document.querySelector('.new-article_steps-container');
        const materialsContainer = document.querySelector('.new-article_materials-container');
        const addMaterial = document.querySelector('.new-article_add-material');
        const removeMaterial = document.querySelector('.new-article_remove-material');
        removeMaterial.style.display = 'none';
    
        // These keep track of the number of steps on the page.
        const steps = [];
        const materialsLength = [];
    
        addStep.addEventListener('click', (event) => {
            event.preventDefault();
            const stepDiv = createElement('div', {id: `step-div-${steps.length}`, class: 'new-article_step-div'}, stepsContainer);
            createElement('label', {name: 'step-label', class: 'new-article_step-label'}, stepDiv, `Step ${steps.length + 1}`);
            createElement('textarea', {name: 'step'}, stepDiv);
            createElement('input', {type: 'file', name: 'image-input', id: `image-input-${steps.length}`}, stepDiv);
            steps.push(steps.length + 1);
            if(steps.length > 0) {
                removeStep.style.display = 'block';
            }
            if(steps.length > 9) {
                addStep.style.display = 'none';
            }
        })
    
        removeStep.addEventListener('click', (event) => {
            event.preventDefault();
            stepsContainer.removeChild(stepsContainer.lastElementChild);
            steps.pop();
    
            if(steps.length < 10) {
                addStep.style.display = 'block';
            }
    
            if(steps.length > 0) {
                removeStep.style.display = 'block';
            } else {
                removeStep.style.display = 'none';
            }
        })
    
        addMaterial.addEventListener('click', (event) => {
            event.preventDefault();
            const materialDiv = createElement('div', {id: 'new-article_material-div', class: 'new-article_material-div'}, materialsContainer);
            createElement('label', {for: `material-input-${materialsLength.length + 1}`, class: 'new-article_material-label'}, materialDiv, `Material ${materialsLength.length + 1}`);
            createElement('input', {id: `material-input-${materialsLength.length + 1}`, name: 'materials'}, materialDiv)
    
            materialsLength.push(materialsLength.length + 1);
    
            if(materialsLength.length > 0) {
                removeMaterial.style.display = 'block';
            }
            if(materialsLength.length > 4) {
                addMaterial.style.display = 'none';
            }
        })
    
        removeMaterial.addEventListener('click', (event) => {
            event.preventDefault();
            materialsContainer.removeChild(materialsContainer.lastElementChild);
            materialsLength.pop();
    
            if(materialsLength.length > 0) {
                removeMaterial.style.display = 'block';
            } else {
                removeMaterial.style.display = 'none';
            }
            if(materialsLength.length < 5) {
                addMaterial.style.display = 'block';
            }
        })
    }
})();
