export function useFormValidation() {
    const handleInvalidSubmit = ({ errors, evt }) => {
        if (Object.keys(errors).length > 0) {
            const formElement = evt.target;
            const firstErrorField = Object.keys(errors)[0];
            const element = formElement.querySelector(`[name="${firstErrorField}"]`);
            if (element) {
                if (element.classList.contains('select2')) {
                    const select2Container = document.querySelector(`#select2-${element.id}-container`);
                    if (select2Container) {
                        select2Container.parentElement.focus();
                    }
                } else {
                    element.focus();
                }
            }
        }
    };

    return {
        handleInvalidSubmit,
    };
}
