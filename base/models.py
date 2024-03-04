from django.db import models
from django.contrib.auth.models import AbstractBaseUser,BaseUserManager
from django.core.exceptions import ValidationError
import uuid
from django.core.validators import MinValueValidator,MaxValueValidator
from django.utils.text import slugify
from django.utils import timezone


class Category(models.Model):
    name=models.CharField(max_length=300,unique=True)
    slug=models.SlugField(max_length=300,unique=True)

    def __str__(self):
        return self.name
    

class Product(models.Model):
    product_name=models.CharField(max_length=300,unique=True)
    slug=models.SlugField(max_length=300,unique=True)
    description=models.TextField(blank=True)
    price=models.DecimalField(decimal_places=2,null=False,blank=False,max_digits=20)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')   #the related_name='products' allow me to use category.products.all()
    rating=models.DecimalField(max_digits=5,decimal_places=1,null=True,blank=True)
    numReviews=models.IntegerField(null=True,blank=True,default=0)
    discount_price=models.DecimalField(decimal_places=2,null=True,blank=True,max_digits=20,verbose_name='price after discount')
    stock=models.PositiveIntegerField(null=False,blank=False,default=0)
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.product_name
    
    
class MyAccountManager(BaseUserManager):
    def create_user(self,first_name,last_name,username,email,password=None,phone_number=None):  #the password=None and phone_number=None mean telling it optional
        if not email:
            raise ValueError("Email Address is invalid")
        if not username:
            raise ValueError('User must have an username')
        user=self.model(
            email=self.normalize_email(email),
            first_name=first_name,
            last_name=last_name,
            username=username,
        )
        user.set_password(password)
        user.phone_number=phone_number
        user.save(using=self._db)
        return user
    
    def create_superuser(self,first_name,last_name,email,username,password):
        user=self.create_user(
            email=self.normalize_email(email),
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        user.is_admin=True 
        user.is_active=True 
        user.is_staff=True 
        user.is_superadmin=True 
        user.save(using=self._db)
        return user

class Account(AbstractBaseUser):
    first_name=models.CharField(max_length=200)
    last_name=models.CharField(max_length=200)
    username=models.CharField(max_length=200,unique=True)
    email=models.EmailField(unique=True)
    phone_number=models.IntegerField(blank=True,null=True)

    date_joined=models.DateTimeField(auto_now_add=True)
    last_login=models.DateTimeField(auto_now=True)
    is_admin=models.BooleanField(default=False)
    is_staff=models.BooleanField(default=False)
    is_active=models.BooleanField(default=False)
    is_superadmin=models.BooleanField(default=False)

    USERNAME_FIELD='email'
    REQUIRED_FIELDS=['username','first_name','last_name']
    objects=MyAccountManager()

    def full_name(self):
        return f'{self.first_name} {self.last_name}'
    
    def __str__(self):
        return self.email
    
    def has_perm(self,perm,obj=None):
        return self.is_admin    #this mean if the user is admin, he/she has the permission to access all things and do any changes
    
    def has_module_perms(self,add_label):
        return True

# class variation(models.Model):
#     id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
#     variant_name=models.CharField(max_length=200)
#     variant_value=models.CharField(max_length=200)
#     variantProduct=models.ForeignKey(Product,on_delete=models.CASCADE)
#     productVariantQuantity=models.PositiveIntegerField(verbose_name='Quantity')
#     productVariantStockStatus=[('In Stock','In Stock'),('Out of Stock','Out of Stock'),('On Backorder','On Backorder')]
#     productVariantStockStatus=models.CharField(max_length=300,choices=productVariantStockStatus,verbose_name='Stock Status',blank=True,null=True)
#     productVariantPrice=models.DecimalField(decimal_places=2,null=False,blank=False,max_digits=20,verbose_name='Original Price')
#     # productVariantDiscount=models.PositiveIntegerField(validators=[MinValueValidator(0),MaxValueValidator(100)],verbose_name='Discount (%)')
#     productVariantDiscountPrice = models.DecimalField(decimal_places=2,null=False,blank=False,max_digits=20,verbose_name='Price After Discount')
#     # productVariantFinalPrice = models.DecimalField(decimal_places=2,null=False,blank=False,max_digits=20,verbose_name='Discounted Price')
#     # productVariantTax = models.PositiveIntegerField(verbose_name='Tax (%)')
#     # productVariantTaxPrice = models.DecimalField(decimal_places=2,null=False,blank=False,max_digits=20,verbose_name='Tax Amount')
#     # productVariantFinalPriceAfterTax = models.DecimalField(decimal_places=2,null=False,blank=False,max_digits=20,verbose_name='Final Price')
#     # variation_category=models.CharField(max_length=200,choices=variation_category_choice)
#     # variation_value=models.CharField(max_length=200)
#     is_active=models.BooleanField(default=True)
#     created_date=models.DateTimeField(auto_now_add=True)
#     updated_date=models.DateTimeField(auto_now=True)

#     def save(self,*args,**kwargs):
#         self.slug=slugify(str(self.variantProduct)+str(self.id))

#         if self.productVariantQuantity>0:
#             self.productVariantStockStatus="In Stock"
        
#         # productVariantDis=self.productVariantDiscount
#         # productVariantPric=self.productVariantPrice 
#         # productVariantDiscAmount=productVariantPric-productVariantDis
#         # self.productVariantFinalPrice=productVariantPric-productVariantDiscAmount
#         # self.productVariantDiscountPrice=productVariantDiscAmount

#         # #final price calculation after tax
#         # productVariantTaxVar = self.productVariantTax
#         # productVariantFinalPriceBeforeTax = self.productVariantFinalPrice
#         # variantTaxAmount =productVariantFinalPriceBeforeTax*productVariantTaxVar
#         # self.productVariantFinalPriceAfterTax = productVariantFinalPriceBeforeTax + variantTaxAmount
#         # self.productVariantTaxPrice = variantTaxAmount
#         super(variation, self).save(*args, **kwargs)

#     def __str__(self):
#         return self.variantProduct.product_name
    
class VariationAttribute(models.Model):
    name=models.CharField(max_length=300)   #example color,size,material

    def __str__(self):
        return self.name
    
class VariationValue(models.Model):
    variation_attribute=models.ForeignKey(VariationAttribute,on_delete=models.CASCADE)
    value=models.CharField(max_length=300)

    def __str__(self):
        return self.value
    

class Variation(models.Model):
    product=models.ForeignKey(Product,on_delete=models.CASCADE)
    variation_attribute=models.ManyToManyField(VariationAttribute,blank=True,null=True)
    variation_values=models.ManyToManyField(VariationValue,blank=True,null=True)
    # quantity=models.PositiveIntegerField()
    # price=models.DecimalField(decimal_places=2,max_digits=20)
    created_at=models.DateTimeField(auto_now_add=True)
    is_updated=models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.product.product_name

class VariationPriceQuantity(models.Model):
    product=models.ForeignKey(Product,on_delete=models.CASCADE)
    variation_name=models.ManyToManyField(VariationAttribute)
    variation_value=models.ManyToManyField(VariationValue)
    price=models.DecimalField(decimal_places=2,max_digits=20)
    discount_price=models.DecimalField(decimal_places=2,max_digits=20,null=True,blank=True)
    quantity=models.PositiveIntegerField()

    def __str__(self):
        variation_names = ', '.join([v.name for v in self.variation_name.all()])
        variation_values = ', '.join([v.value for v in self.variation_value.all()])
        return f"{self.product.product_name} - Variations: {variation_names} | Values: {variation_values}"
    
    def clean(self):
        super().clean()
        if self.discount_price is not None and self.discount_price > self.price:
            raise ValidationError("Discount price must not exceed the price.")
    
class shipping_fees(models.Model):
    fees=models.DecimalField(decimal_places=2,null=False,blank=False,max_digits=20)

    def __str__(self):
        return self.fees
    

class Cart(models.Model):
    cart_id=models.CharField(max_length=300,blank=True)
    date_added=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.cart_id

class DiscountCode(models.Model):
    promo_code = models.CharField(max_length=200,unique=True)
    discount_type = models.CharField(max_length=50, choices=(('percentage', 'Percentage'), ('fixed', 'Fixed Amount')))
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    max_discount_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False,default=0)
    start_date = models.DateTimeField(null=False, blank=False,default=timezone.now)
    end_date = models.DateTimeField(null=False, blank=False,default=timezone.now)
    usage_limit = models.IntegerField(null=False, blank=False)
    usage_per_user = models.IntegerField(default=1)
    active = models.BooleanField(default=True)
    applicable_products= models.ManyToManyField(Product, blank=True, related_name='applicable_discounts',verbose_name='product without variation')
    applicable_variations = models.ManyToManyField(VariationPriceQuantity, blank=True, related_name='applicable_discounts',verbose_name='product with variation')
    apply_to_all_products = models.BooleanField(default=False,null=False,blank=True)
    #apply_to_all_variations = models.BooleanField(default=False,null=False,blank=True)

    def __str__(self):
        return self.promo_code

    def is_applicable(self, product=None, variation=None):
        # Logic to determine if the discount code is applicable to a given product or variation
        if self.applicable_products.exists():
            # Check if the discount is applicable to specific products
            if product and self.applicable_products.filter(id=product.id).exists():
                return True
        if self.applicable_variations.exists():
            # Check if the discount is applicable to specific variations
            if variation and self.applicable_variations.filter(id=variation.id).exists():
                return True
        if not self.applicable_products.exists() and not self.applicable_variations.exists():
            # If no specific products or variations are set, the discount is applicable to all
            return True
        return False
    
    def calculate_discount(self, price):
    # """
    # Calculate the discount amount for a given price.
    # Returns the discount amount, ensuring it does not exceed the max_discount_value (if set).
    # """
        if self.discount_type == 'percentage':
            # Calculate percentage discount
            discount_amount = (self.discount_value / 100) * price
            # Apply the maximum discount value cap if necessary
            if self.max_discount_value is not None:
                discount_amount = min(discount_amount, self.max_discount_value)
        elif self.discount_type == 'fixed':
            # Apply fixed discount
            discount_amount = self.discount_value
            # Ensure the discount does not exceed the product price itself
            discount_amount = min(discount_amount, price)
        else:
            # Default to no discount if discount_type is not recognized
            discount_amount = 0
        return discount_amount

    def clean(self):
        # Validate that the code is active only within the start and end dates
        if self.active and not (self.start_date <= timezone.now() <= self.end_date):
            raise ValidationError("The discount code can only be active within the start and end date range.")
        if self.end_date < self.start_date:
            raise ValidationError("End date cannot be earlier than start date.")
        # Since we cannot check ManyToMany fields on unsaved instances directly in clean(),
        # defer this check to the save method or ensure the instance already exists.

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)  # Save the instance first to ensure it has an ID

        if self.apply_to_all_products:
            self.applicable_products.clear()
            self.applicable_variations.clear()
        
        super().save(*args, **kwargs)  # Re-save to persist any changes

class CartItem(models.Model):
    user=models.ForeignKey(Account,on_delete=models.CASCADE,null=True)
    product=models.ForeignKey(Product,on_delete=models.CASCADE)
    variations=models.ForeignKey(VariationPriceQuantity,on_delete=models.CASCADE,null=True,blank=True)
    #cart=models.ForeignKey(Cart,on_delete=models.CASCADE,null=True,blank=True)
    quantity=models.PositiveIntegerField()
    is_active=models.BooleanField(default=True)

    def __str__(self):
        return self.product.product_name
    
    def sub_total(self):
    # Check if this cart item has a specific variation with a special price
        if self.variations:
            if self.variations.discount_price:
                return self.variations.discount_price * self.quantity
            else:
                return self.variations.price * self.quantity
        else:
            # No specific variation, so calculate based on the product's price
            if self.product.discount_price:
                return self.product.discount_price * self.quantity
            else:
                return self.product.price * self.quantity
    
def product_image_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/products/image/<product_name>/<filename>
    product_name = slugify(instance.product.product_name)
    return f'products/image/{product_name}/{filename}'

def product_image_directory_path1(instance, filename):
    # file will be uploaded to MEDIA_ROOT/products/image/<product_name>/<filename>
    product_name = slugify(instance.product.product_name)
    return f'products-image/{product_name}/{filename}'

def product_image_directory_path2(instance, filename):
    # file will be uploaded to MEDIA_ROOT/products/image/<product_name>/<filename>
    product_name = slugify(instance.product.product_name)
    return f'products-thumbnail/{product_name}/{filename}'

class ProductImage_primary(models.Model):
    product=models.ForeignKey(Product,on_delete=models.CASCADE)
    image=models.ImageField(null=True,blank=True,upload_to=product_image_directory_path)
    #product_variation=models.ForeignKey(VariationPriceQuantity,on_delete=models.DO_NOTHING,blank=True,null=True)

    def __str__(self):
        return self.product.product_name

class ProductImage_product(models.Model):
    product=models.ForeignKey(Product,on_delete=models.CASCADE)
    product_image=models.ImageField(null=True,blank=True,upload_to=product_image_directory_path1)
    product_variation=models.ForeignKey(VariationPriceQuantity,on_delete=models.DO_NOTHING,null=True,blank=True)

    def __str__(self):
        return self.product.product_name
    
class ProductImage_thumbnail(models.Model):
    product=models.ForeignKey(Product,on_delete=models.CASCADE)
    product_image=models.ImageField(null=True,blank=True,upload_to=product_image_directory_path2)
    product_variation=models.ForeignKey(VariationPriceQuantity,on_delete=models.DO_NOTHING,null=True,blank=True)

    def __str__(self):
        return self.product.product_name
    