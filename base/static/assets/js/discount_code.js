//for admin page discount
// document.addEventListener("DOMContentLoaded", function() {
//     // Function to enable or disable the applicable_products field
//     function toggleApplicableProducts(disable) {
//         const applicableProductsField = document.querySelector('.field-applicable_products');
//         if (applicableProductsField) {
//             const inputs = applicableProductsField.getElementsByTagName('input');
//             const selects = applicableProductsField.getElementsByTagName('select');
//             for (let input of inputs) {
//                 input.disabled = disable;
//             }
//             for (let select of selects) {
//                 select.disabled = disable;
//             }
//         }
//     }

//     // Listen for changes on the apply_to_all_products checkbox
//     const applyToAllProductsCheckbox = document.querySelector('#id_apply_to_all_products');
//     if (applyToAllProductsCheckbox) {
//         applyToAllProductsCheckbox.addEventListener('change', function() {
//             toggleApplicableProducts(this.checked);
//         });

//         // Initial toggle on page load based on current checkbox state
//         toggleApplicableProducts(applyToAllProductsCheckbox.checked);
//     }
// });

document.addEventListener("DOMContentLoaded", function() {
    const applyToAllCheckbox = document.getElementById('id_apply_to_all_products');
    const productsSelect = document.getElementById('id_applicable_products');
    console.log('are you working?')
    function selectAllProducts() {
        for (let option of productsSelect.options) {
            option.selected = applyToAllCheckbox.checked;
        }
    }

    function checkAllSelected() {
        let allSelected = true;
        for (let option of productsSelect.options) {
            if (!option.selected) {
                allSelected = false;
                break;
            }
        }
        applyToAllCheckbox.checked = allSelected;
    }

    applyToAllCheckbox.addEventListener('change', function() {
        selectAllProducts();
    });

    productsSelect.addEventListener('change', function() {
        checkAllSelected();
    });
});