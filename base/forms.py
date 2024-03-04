from django import forms
from django.core.exceptions import ValidationError
from .models import DiscountCode

class DiscountCodeForm(forms.ModelForm):
    class Meta:
        model=DiscountCode
        fields='__all__'

    def clean(self):
        cleaned_data = super().clean()
        apply_to_all_products = cleaned_data.get("apply_to_all_products")
        discount_type = cleaned_data.get("discount_type")
        discount_value = cleaned_data.get("discount_value")
        # If 'apply_to_all_products' is True, ensure ManyToMany relations are not set
        if apply_to_all_products:
            applicable_products = cleaned_data.get("applicable_products")
            applicable_variations = cleaned_data.get("applicable_variations")

            if applicable_products or applicable_variations:
                raise ValidationError(
                    "No products or variations should be selected when 'Apply to all products' is checked."
                )
         # Check if discount_type is 'percentage' and discount_value is greater than 100
        if discount_type == 'percentage' and discount_value > 100:
            raise ValidationError({
                'discount_value': "Percentage discount value cannot be more than 100."
            })
        return cleaned_data