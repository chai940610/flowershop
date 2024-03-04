from django.contrib import admin
from base.models import DiscountCode,shipping_fees,ProductImage_thumbnail,ProductImage_product,VariationPriceQuantity,Product,Category,ProductImage_primary,Account,Cart,CartItem,Variation,VariationAttribute,VariationValue
from django.contrib.auth.admin import UserAdmin
from .forms import DiscountCodeForm


class AccountAdmin(UserAdmin):
    list_display=('email','first_name','last_name','username','last_login','is_active','date_joined')
#due to we using custom user admin, some rules we need to follow
    filter_horizontal=()
    list_filter=()
    fieldsets=()
    list_display_links=('email','first_name','last_name')
    readonly_fields=('last_login','date_joined')
    ordering=('-date_joined',)   #list in descening order

class babi(admin.ModelAdmin):
    prepopulated_fields={'slug':('product_name',)}
    list_display=('product_name','stock','category')

class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields={'slug':('name',)}
    list_display=['name','slug']

class CartItemAdmin(admin.ModelAdmin):
    list_display=('user', 'product', 'variations', 'quantity')

    def get_queryset(self, request):    #this purpose is to reduce the number of database queries
        # This method is optional. It is used to optimize query performance
        # by selecting related fields in one database query.
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('user', 'product', 'variations')
        return queryset

# class DiscountCodeAdminForm(forms.ModelForm):
#     class Meta:
#         model=DiscountCode
#         fields="__all__"
#     class Media:
#         js=('assets/js/discount_code.js')

# @admin.register(DiscountCode)
# class DiscountCodeAdmin(admin.ModelAdmin):
#     form=DiscountCodeAdminForm


class DiscountCodeAdmin(admin.ModelAdmin):
    form = DiscountCodeForm

admin.site.register(DiscountCode, DiscountCodeAdmin)
admin.site.register(shipping_fees)
admin.site.register(Product,babi)
admin.site.register(Category,CategoryAdmin)
admin.site.register(ProductImage_primary)
admin.site.register(Account,AccountAdmin)
admin.site.register(Cart)
admin.site.register(CartItem,CartItemAdmin)
admin.site.register(Variation)
admin.site.register(VariationAttribute)
admin.site.register(VariationValue)
admin.site.register(VariationPriceQuantity)
admin.site.register(ProductImage_product)
admin.site.register(ProductImage_thumbnail)
# Register your models here.
