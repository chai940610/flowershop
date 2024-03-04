from django.shortcuts import render,get_object_or_404,redirect,render
from base.models import DiscountCode,shipping_fees,ProductImage_thumbnail,Product,ProductImage_product,Category,Account,Variation,Cart,CartItem,VariationPriceQuantity
from django.core.paginator import EmptyPage,PageNotAnInteger,Paginator
from django.contrib import messages,auth
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode,urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMessage
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist,MultipleObjectsReturned
from decimal import Decimal
from django.http import JsonResponse,HttpResponse
import json
from django.forms.models import model_to_dict
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin

class HomeView(LoginRequiredMixin,TemplateView):
    template_name="home.html"

# def base(request):
#     category1=Category.objects.all()
#     product1=Product.objects.all()
#     return render(request,'base.html',{'category':category1,'products':product1})

def store(request, category_slug=None):
    categories = None
    products = None
    if category_slug is not None:
        categories = get_object_or_404(Category, slug=category_slug)
        products = Product.objects.filter(category=categories)
        paginator = Paginator(products, 12)
        page = request.GET.get('page')
        paged_product = paginator.get_page(page)
        products_count = products.count()
    else:
        products = Product.objects.all().order_by('rating')
        # paginator
        paginator = Paginator(products, 12)
        page = request.GET.get('page')
        paged_product = paginator.get_page(page)
        products_count = products.count()
    return render(request, 'store.html', {'products': paged_product, 'products_count': products_count})

def categories(request):
    return {'categories':Category.objects.all()}

def home(request):
    products = Product.objects.all()

    # Define the initial offset
    offset = 0

    modified_products = []

    for i in range(len(products)):
        print('i',i)
        print('offset', offset)
        print('length',len(products))
        current_index = offset
        next_index = (offset + 1)
        
        # Ensure that both indices are within the valid range
        if current_index < len(products) and next_index < len(products):
            print('current_index', current_index)
            print('next_index', next_index)
            
            current_product = products[current_index]
            next_product = products[next_index]
            
            print('current product', current_product)
            print('next_product', next_product)
            
            modified_products.append((current_product, next_product))

        # Update the offset for the next iteration
        offset += 2

    return render(request, 'home.html', {'modified_products': modified_products})

def about(request):
    return render(request,'about.html')

# def login(request):
#     if request.method=="POST":
#         email=request.POST['email']
#         password=request.POST['password']
#         user1=auth.authenticate(email=email,password=password)
#         if user1 := auth.authenticate(email=email,password=password):
#             auth.login(request.user1)
#             messages.success(request,'You are logged in')
#             # return redirect('home')
#         else:
#             messages.error(request,'Invalid login credentials')
#             return redirect('login')
#     return render(request,'login.html')

def login(request):
    if 'loginMessage' in request.GET:
        messages.info(request,'Please log in to add items to your cart.')
    if request.method == "POST":
        email = request.POST['email']
        password = request.POST['password']

        # Use assigned variable instead of 'user1'
        if user := auth.authenticate(email=email, password=password):   #this is walrus operator, it assign the value email and password to the variable user
            # it made it look shorter, in general way, we always like this 
            # user=auth.authenticate(email=email,password=password)
            # if user:
            # else:
            auth.login(request, user)
            messages.success(request, "You are logged in!")
            # Uncomment if you want to redirect after login
            return redirect('home')
        else:
            messages.error(request, "Invalid login credentials")
            return redirect('login')
    return render(request, 'login.html')
        
def register(request):
    if request.method=="POST":
        first_name=request.POST['first_name']
        last_name=request.POST['last_name']
        email=request.POST['email']
        phone_number=request.POST['phone_number']
        password=request.POST['password']
        confirm_password=request.POST['confirm_password']
        #validate data
        if password != confirm_password:
            messages.error(request,"Password don't match!")
            return render(request,'register.html')
        elif not password or not confirm_password:
            messages.error(request, "Password and confirm password are required.")
            return render(request, 'register.html')
        elif not phone_number:
            phone_number=None
        #create user
        try:
            user=Account.objects.create_user(email=email,username=email.split('@')[0],password=password,first_name=first_name,last_name=last_name,phone_number=phone_number)
            user.save()
            messages.info(request,"Thanks for registering! Check your email for verification.")
            #user activation
            current_site=get_current_site(request)
            mail_subject="Welcome to Fingrace Flowers! Verify Your Account and Unlock the Possibilities."
            message=render_to_string('verification_email.html',{
                'user':user,
                'domain':current_site,
                'uid':urlsafe_base64_encode(force_bytes(user.pk)),
                'token':default_token_generator.make_token(user),
            })
            to_email=email
            send_email=EmailMessage(mail_subject,message,to=[to_email])
            send_email.send()
        except Exception as e:
            messages.error(request,f"Registration failed:{e}")
    return render(request,'register.html')

def activate(request,uidb64,token):
    try:
        uid=urlsafe_base64_decode(uidb64).decode()
        user=Account._default_manager.get(pk=uid)
    except(TypeError,ValueError,OverflowError,Account.DoesNotExist):
        user=None
    if user is not None and default_token_generator.check_token(user,token):
        user.is_active=True
        user.save()
        messages.success(request,'Congratulation! Your account is activated.')
        return redirect('login')
    else:
        messages.error(request,'Invalid activation link')
        return redirect('register')

@login_required(login_url='login')
def logout(request):
    auth.logout(request)
    messages.success(request,'You are logged out.')
    return redirect('login')

def _cart_id(request):
    cart=request.session.session_key
    if not cart:
        cart=request.session.create()
    return cart

@login_required(login_url='login')
def cart(request,total=0,quantity=0,cart_items=None,tax=0,grand_total=0,sub_total=0,shipping=0):
    try:
        if request.user.is_authenticated:
            #get all the promocode from database
            # promocode=DiscountCode.objects.all()
            # print('what is the current promo code:',promocode)     
            cart_items=CartItem.objects.filter(user=request.user,is_active=True)
            for cart_item in cart_items:
                sub_total = cart_item.sub_total()
                total += sub_total
                quantity+=cart_item.quantity #number of item
            tax = total * Decimal("0.06")
            shipping_instance = shipping_fees.objects.get(pk=1)
            shipping = shipping_instance.fees
            grand_total=total+shipping
        else:
            cart=Cart.objects.get(cart_id=_cart_id(request))
            cart_items=CartItem.objects.filter(cart=cart,is_active=True)
           #to show total how many item in the cart

    except ObjectDoesNotExist:
        pass 
    return render(request,'cart.html',{'shipping_fees':shipping,'total':total,'quantity':quantity,'cart_items':cart_items,'tax':tax,'grand_total':grand_total})

@login_required(login_url='login')
def add_cart(request, product_slug):
    variation_names = []
    variation_values = []
    quantity=0
    selected_variations_id=0
    user = request.user
    product = get_object_or_404(Product, slug=product_slug)
    
    # cart_item_exists = CartItem.objects.filter(
    #         user=user,
    #         product=product,
    #         variations__in=product.variation_set.all(),
    #         is_active=True
    #     ).exists()
    # print('cart item exist?',cart_item_exists)
    if request.method == "POST":
        try:
            is_product_variation_exist1 = product.variation_set.all().exists()
            data = json.loads(request.body.decode('utf-8'))
            print('what is the current user:',user)
            print('data', data)
            if data:
                if is_product_variation_exist1:
                    variation_names = data['attributes']
                    variation_values = data['values']
                    quantity=data['quantity']
                    print('variation_names2', variation_names)
                    print('variation_values2', variation_values)
                    print('input quantity:',quantity)
                else:
                    quantity1=data['quantity1']
                    quantity1=int(quantity1)
                    print('what is the input quantity without variation:',quantity1)
                # Your logic for adding to cart goes here
                # ...
                
            else:
                print('No data received in the POST request.')
                return JsonResponse({'status': 'Error', 'message': 'No data received in the POST request.'})
            #is_product_variation_exist = product.variation_set.all().exists()
            if is_product_variation_exist1:
                # variation_names = data['attributes']
                # variation_values = data['values']
                # quantity=data['quantity']
                # print('variation_names2', variation_names)
                # print('variation_values2', variation_values)
                # print('input quantity:',quantity)
                selected_variations = VariationPriceQuantity.objects.filter(
                product=product,
                variation_name__name__in=variation_names,
                variation_value__value__in=variation_values)
                variation_names1 = []
                variation_values1 = []
                print('what is the selected variations:', selected_variations)
                for variation in selected_variations:
                    variation_names1 = [name.name for name in variation.variation_name.all()]
                    variation_values1 = [value.value for value in variation.variation_value.all()]
                    #variation_names1.extend(names)
                    #variation_values1.extend(values)
                    print('what is the variation_names1:',variation_names1)
                    print('what is the variation_value1:',variation_values1)
                    if set(variation_names) == set(variation_names1) and set(variation_values1) == set(variation_values):
                        print('what is the id of selected variation:',variation.pk)
                        selected_variations_id=variation.pk
                    else:
                        pass
                selected_variations1=VariationPriceQuantity.objects.get(pk=(selected_variations_id))
                #now check cart item exists this item or not
                is_cart_item_exist = CartItem.objects.filter(user=user,product=product,variations=selected_variations1).exists()
                if is_cart_item_exist:
                    cartitem=CartItem.objects.get(user=user,product=product,variations=selected_variations1)
                    cartitem.quantity=cartitem.quantity+int(quantity)
                    if int(cartitem.quantity) <= int(selected_variations1.quantity):
                        cartitem.save()
                        return JsonResponse({'status': 'success', 'message': 'Item added to cart'},status=200)
                    else:
                        return JsonResponse({'status': 'Error', 'message': 'The quantity in your cart has exceeded the available quantity of the product.'}, status=400)
                else:
                    cartitem=CartItem.objects.create(user=user,product=product,variations=selected_variations1,quantity=quantity)
                    if int(cartitem.quantity) <= int(selected_variations1.quantity):
                        cartitem.save()
                        return JsonResponse({'status': 'success', 'message': 'Item added to cart'},status=200)
                    else:
                        return JsonResponse({'status': 'Error', 'message': 'The quantity in your cart has exceeded the available quantity of the product.'}, status=400)
                #print('variation names in add cart:', variation_names1)
                #print('variation values in add cart:', variation_values1)
                #check cart item have this item or not
                #return JsonResponse({'status': 'success', 'message': 'Item added to cart'})
            else:
                #check the product is in the cart item or not
                is_product_without_variation_in_cartitem=CartItem.objects.filter(user=user,product=product).exists()
                #print('yes the product in cart item no variation:',is_product_without_variation_in_cartitem)
                if is_product_without_variation_in_cartitem:
                    cartitem1=CartItem.objects.get(user=user,product=product)
                    cartitem1.quantity=int(cartitem1.quantity)+int(quantity1)
                    if cartitem1.quantity<=product.stock:
                        cartitem1.save()
                        return JsonResponse({'status': 'success', 'message': 'Item added to cart'},status=200)
                    else:
                        return JsonResponse({'status': 'Error', 'message': 'The quantity in your cart has exceeded the available quantity of the product.'}, status=400)
                else:
                    cartitem2=CartItem.objects.create(user=user,product=product,quantity=quantity1)
                    if cartitem2.quantity <= product.stock:
                        cartitem2.save()
                        return JsonResponse({'status': 'success', 'message': 'Item added to cart'},status=200)
                    else:
                        return JsonResponse({'status': 'Error', 'message': 'The quantity in your cart has exceeded the available quantity of the product.'}, status=400)
        except json.JSONDecodeError:
            print('testing')
            return JsonResponse({'status': 'Error', 'message': 'Invalid JSON data.'})
    else:
    # For non-POST requests or if you reach the end of the view without returning
        return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)
    
    
@login_required(login_url='login')
def update_cart(request):
    print("helo")
    if request.method == "POST":
        product_id = request.POST.get('id')
        quantity = request.POST.get('quantity')
        print('product id',product_id)
        print('quantity',quantity)
        cart_item = CartItem.objects.get(id=product_id)
        cart_item.quantity = quantity
        cart_item.save()
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'success': False, 'error': 'Invalid request'})

@login_required(login_url='login')
def coupon_apply(request):
    user = request.user
    cart_items = CartItem.objects.filter(user=user)
    if request.method == "POST":
        promo_code = request.POST.get('couponValue')
        matching_coupon = DiscountCode.objects.filter(promo_code=promo_code).first()
        if matching_coupon:
            if matching_coupon.active and timezone.now() <= matching_coupon.end_date:
                if matching_coupon.apply_to_all_products:
                    # Coupon logic for all products
                    print('all product got discount')
                    #now check for discount type is percentage or fixed
                    applicable_cart_item_ids = cart_items.values_list('id', flat=True)
                    discount_type=matching_coupon.discount_type
                    min_spending=matching_coupon.min_order_value
                    if discount_type=='fixed':
                        print('discount kao kao')
                        discount_value=matching_coupon.discount_value
                        return JsonResponse({
                            'success': True, 
                            'message': 'Coupon applied successfully',
                            'applicable_cart_item_ids': list(applicable_cart_item_ids),
                            'discount_value':discount_value,  
                            'min_spending':min_spending,
                            'discount_type':discount_type,
                            'all_product':matching_coupon.apply_to_all_products,
                            'promo_code':matching_coupon.promo_code,
                            })
                    else:
                        print('discount tam puk')
                        #percentage
                        discount_value=matching_coupon.discount_value
                        max_discount=matching_coupon.max_discount_value
                        return JsonResponse({
                            'success': True, 
                            'message': 'Coupon applied successfully',
                            'applicable_cart_item_ids': list(applicable_cart_item_ids),  # Add this line
                            'discount_value':discount_value,  #discount_value1 is for percentage in javascript
                            'min_spending':min_spending,
                            'max_discount':max_discount,
                            'discount_type':discount_type,
                            'all_product':matching_coupon.apply_to_all_products,
                            'promo_code':matching_coupon.promo_code,
                        })
                    #return JsonResponse({'success': True, 'message': 'Coupon applied successfully'})
                else:
                    print('selected product got discount')
                    # Get the IDs of the selected products and variations
                    selected_product_ids = matching_coupon.applicable_products.values_list('id', flat=True)
                    selected_variation_ids = matching_coupon.applicable_variations.values_list('id', flat=True)
                    print('what is the selected product:',selected_product_ids)
                    print('what is the selected variation:',selected_variation_ids)
                    # Filter cart_items for products
                    applicable_products_cart_items = cart_items.filter(product__id__in=selected_product_ids,variations=None)
                    # Filter cart_items for variations
                    applicable_variations_cart_items = cart_items.filter(variations__id__in=selected_variation_ids)
                    print('are the similar in cart item product?:',applicable_products_cart_items)
                    print('are they similar in cart item variation?:',applicable_variations_cart_items)
                    # Combine queries
                    applicable_cart_items = applicable_products_cart_items | applicable_variations_cart_items
                    print('applicable_cart_items:',applicable_cart_items)       
                    if applicable_cart_items.exists():
                        applicable_cart_item_ids = applicable_cart_items.values_list('id', flat=True)
                        print('IDs of applicable cart items:', list(applicable_cart_item_ids))
                        # Coupon logic for applicable items
                        #return JsonResponse({'success': True, 'message': 'Coupon applied successfully'})
                        #okay now check the coupon is percentage or Fixed Amount
                        discount_type1=matching_coupon.discount_type
                        min_spending=matching_coupon.min_order_value
                        print('what is the discount type?:',discount_type1)
                        print('what is the minimum spending for this voucher:',min_spending)
                        if discount_type1 =='fixed':
                            discount_value1=matching_coupon.discount_value
                            print('what is the discount_value:',discount_value1)
                            return JsonResponse({
                            'success': True, 
                            'message': 'Coupon applied successfully',
                            'applicable_cart_item_ids': list(applicable_cart_item_ids),  # Add this line
                            'discount_value':discount_value1,   
                            'min_spending':min_spending,
                            'discount_type':discount_type1,
                            'all_product':matching_coupon.apply_to_all_products,
                            'promo_code':matching_coupon.promo_code,
                            })
                        else:
                            discount_value2=matching_coupon.discount_value  #this is for percentage
                            max_discount=matching_coupon.max_discount_value
                            print('what is the discount_value:',discount_value2)
                            print('what is the max discount?',max_discount)
                            return JsonResponse({
                            'success': True, 
                            'message': 'Coupon applied successfully',
                            'applicable_cart_item_ids': list(applicable_cart_item_ids),  # Add this line
                            'discount_value':discount_value2,  #discount_value1 is for percentage in javascript
                            'min_spending':min_spending,
                            'max_discount':max_discount,
                            'discount_type':discount_type1,
                            'all_product':matching_coupon.apply_to_all_products,
                            'promo_code':matching_coupon.promo_code,
                        })
                        # return JsonResponse({
                        #     'success': True, 
                        #     'message': 'Coupon applied successfully',
                        #     'applicable_cart_item_ids': list(applicable_cart_item_ids)  # Add this line
                        # })
                    else:
                        # No cart items are applicable for the coupon
                        return JsonResponse({'success': False, 'error': 'No applicable items for the coupon in the cart'})
            else:
                # Coupon is either inactive or expired
                return JsonResponse({'success': False, 'error': 'Coupon Expired or Inactive'})
        else:
            # No matching coupon found
            return JsonResponse({'success': False, 'error': 'Invalid coupon code'})
    else:
        # Request method is not POST
        return JsonResponse({'success': False, 'error': 'Invalid request'})

@login_required(login_url='login')
def remove_cart_item(request,lanli):
    cart_item=CartItem.objects.get(id=lanli)
    if request.user.is_authenticated:
        cart_item.delete()
        return redirect('cart')


def product_detail(request, doll):
    product = get_object_or_404(Product, slug=doll)
    user=request.user
    variation_names = []
    variation_values = []
    variation_names1=[]
    variation_values1=[]
    id=0
    biggest_price=0
    smallest_price=0
    attribute_values_dict = {}
    variation_price_quantity=None
    product_image=ProductImage_product.objects.filter(product=product)
    print('what is the product image for product:',product_image)
    product_thumbnail=ProductImage_thumbnail.objects.filter(product=product)
    print('what is the current user',user)
    if request.user.is_authenticated:
        logged_in=True
    else:
        logged_in=False


    if request.method == "POST":
        data = json.loads(request.body.decode('utf-8'))
        print('data', data)
        if data:
            print('data1 attribute:', data['attributes'])
            print('data1 value:', data['values'])
            variation_names = data['attributes']
            variation_values = data['values']
            print('variation_names',variation_names)
            print('variation_values',variation_values)
            # return JsonResponse({'status': 'Success'})
        else:
            # Handle the case when 'data' is None
            print('No data received in the POST request.')
            return JsonResponse({'status': 'Error', 'message': 'No data received in the POST request.'})
    
    variation_items = VariationPriceQuantity.objects.filter(
        product=product,
        variation_name__name__in=variation_names,
        variation_value__value__in=variation_values
    )
    variation_items1=VariationPriceQuantity.objects.filter(product=product)
    if variation_items1.exists():
        variation_prices  = [variation_item.price for variation_item in variation_items1]
        variation_discount_price=[variation_item.discount_price for variation_item in variation_items1]
        print('variation all price',variation_prices)
        print('variation all discount price',variation_discount_price)
        combined_prices = [(price, discount_price) for price, discount_price in zip(variation_prices, variation_discount_price)]
        print('combine prices',combined_prices)
        #find the smallest number
        #filter the price first
        smallest_price = min(combined_prices, key=lambda pair: pair[1] if pair[1] is not None else float('inf'))[1] #else float('inf') mean treat it as ignore
        print('smallest prices',smallest_price)
        #biggest price
        biggest_price = max(combined_prices, key=lambda pair: pair[0])[0]
        print('biggest prices',biggest_price)
    if variation_items.exists():
        for variation_item in variation_items:
            
            print(f"ID: {id}, Price: {variation_item.price}, Quantity: {variation_item.quantity}")
            # Access the attributes of each variation_item
            print('variation item quantity', variation_item.quantity)
            print('variation item price', variation_item.price)
            variation_names1 = [variation_name.name for variation_name in variation_item.variation_name.all()]  #the variation_name1 is the one loop thru all the values and attributes, and show out here
            variation_values1 = [variation_value.value for variation_value in variation_item.variation_value.all()]
            print('variation name11',variation_names1)
            print('variation values11',variation_values1)
            if set(variation_names) == set(variation_names1) and set(variation_values1) == set(variation_values):
                print("variation_names and variation_values have the same elements.")
                id=variation_item.id
                print('same element id',id)
                variation_price_quantity=VariationPriceQuantity.objects.get(pk=id)
                images=ProductImage_product.objects.filter(product_variation=variation_price_quantity)
                print('got any image?:',images)
                image_urls=[image.product_image.url for image in images]
                variation_price_quantity_dict = {
                    'image_urls': image_urls,
                    'id': variation_price_quantity.id,
                    'price': variation_price_quantity.price,
                    'discount_price': variation_price_quantity.discount_price,
                    'quantity':variation_price_quantity.quantity,
                    # Add other fields as needed
                }
                print('variation_price_quantity_dict',variation_price_quantity_dict)
                return JsonResponse({'variation_price_quantity': variation_price_quantity_dict})
            else:
                print("variation_names and variation_values do not have the same elements.")
    else:
        # Handle the case when no matching variation is found
        print('No matching variation found.')
        print('variation name3',variation_names1)
        print('variation values3',variation_values1)
        variations = product.variation_set.all()
        attribute_values_dict = {}

        # Check if the product has any variations
        if variations.exists():
            # Loop through the variations and attributes as before
            for variation in variations:
                for attribute in variation.variation_attribute.all():
                    attribute_name = attribute.name

                    if attribute_name not in attribute_values_dict:
                        attribute_values_dict[attribute_name] = []

                    values = variation.variation_values.filter(variation_attribute=attribute)
                    attribute_values_dict[attribute_name].extend(values.values_list('value', flat=True))

        else:
            # Assign a default value to the attribute_values_dict
            attribute_values_dict["Variation"] = ["None"]
    return render(request, 'product_detail.html', {'product_thumbnail':product_thumbnail,'product_image':product_image,'biggest_figure': biggest_price, 'smallest_figure': smallest_price, 'product': product, 'attribute_values_dict': attribute_values_dict})
# def product_detail(request, doll):
#     product = get_object_or_404(Product, slug=doll)
#     variation_names = []
#     variation_values = []
#     variation_names1 = []
#     variation_values1 = []
#     match_id = 0
#     biggest_price = 0
#     smallest_price = 0

#     if request.method == "POST":
#         data = json.loads(request.body.decode('utf-8'))
#         print('data', data)
#         if data:
#             print('data1 attribute:', data['attributes'])
#             print('data1 value:', data['values'])
#             variation_names = data['attributes']
#             variation_values = data['values']
#             return JsonResponse({'status': 'Success'})
#         else:
#             # Handle the case when 'data' is None
#             print('No data received in the POST request.')
#             return JsonResponse({'status': 'Error', 'message': 'No data received in the POST request.'})
    
#         # variation_names = data['attributes']
#         # variation_values = data['values']
#     variation_items = VariationPriceQuantity.objects.filter(
#         product=product,
#         variation_name__name__in=variation_names,
#         variation_value__value__in=variation_values
#     )
#     variation_items1=VariationPriceQuantity.objects.filter(product=product)
#     # Check if any variations match the criteria
#     if variation_items.exists():
#         variation_prices  = [variation_item.price for variation_item in variation_items1]
#         variation_discount_price=[variation_item.discount_price for variation_item in variation_items1]
#         print('variation all price',variation_prices)
#         print('variation all discount price',variation_discount_price)
#         combined_prices = [(price, discount_price) for price, discount_price in zip(variation_prices, variation_discount_price)]
#         print('combine prices',combined_prices)
#         #find the smallest number
#         #filter the price first
#         smallest_price = min(combined_prices, key=lambda pair: pair[1] if pair[1] is not None else float('inf'))[1] #else float('inf') mean treat it as ignore
#         print('smallest prices',smallest_price)
#         #biggest price
#         biggest_price = max(combined_prices, key=lambda pair: pair[0])[0]
#         print('biggest prices',biggest_price)
#         # for variation_item in variation_items:
#         #     variation_names2=([variation_name.name for variation_name in variation_item.variation_name.all()])
#         #     variation_values2=([variation_value.value for variation_value in variation_item.variation_value.all()])
#         # print('variation name2',variation_names2)
#         # print('variation values2',variation_values2)
#         for variation_item in variation_items:
#             id=variation_item.id
#             print(f"ID: {id}, Price: {variation_item.price}, Quantity: {variation_item.quantity}")
#             # Access the attributes of each variation_item
#             print('variation item quantity', variation_item.quantity)
#             print('variation item price', variation_item.price)
#             variation_names1 = [variation_name.name for variation_name in variation_item.variation_name.all()]
#             variation_values1 = [variation_value.value for variation_value in variation_item.variation_value.all()]
#             if set(variation_names) == set(variation_names1):
#                 print("variation_names and variation_name1 have the same elements.")
#             else:
#                 print("variation_names and variation_name1 do not have the same elements.")
#             if set(variation_values1) == set(variation_values):
#                 print("variation_names and variation_name1 have the same elements.")
#                 match_id=variation_item.id
#                 print('match id',match_id)
#             else:
#                 print("variation_names and variation_name1 do not have the same elements.")
#                 print('variation name1',variation_names1)
#                 print('variation values1',variation_values1)
#                 for variation_name in variation_item.variation_name.all():
#                     print('variation name', variation_name.name)
#                     # variation_names1.append[variation_name.name]
#                     # print('Variation name tuple',variation_names1)
#                 for variation_value in variation_item.variation_value.all():
#                     print('variation value', variation_value.value)
#                     # variation_values1.append[variation_value.value]
#                     # print('Variation Value tuple',variation_values1)
#         else:
#             # Handle the case when no matching variation is found
#             print('No matching variation found.')

#         print('variation name3',variation_names1)
#         print('variation values3',variation_values1)
#         variations = product.variation_set.all()
#         attribute_values_dict = {}

#         # Check if the product has any variations
#     if variations.exists():
#         # Loop through the variations and attributes as before
#         for variation in variations:
#             for attribute in variation.variation_attribute.all():
#                 attribute_name = attribute.name

#                 if attribute_name not in attribute_values_dict:
#                     attribute_values_dict[attribute_name] = []

#                     values = variation.variation_values.filter(variation_attribute=attribute)
#                     attribute_values_dict[attribute_name].extend(values.values_list('value', flat=True))

#     else:
#         # Assign a default value to the attribute_values_dict
#          attribute_values_dict["Variation"] = ["None"]

#     return render(request, 'product_detail.html', {'biggest_figure':biggest_price,'smallest_figure':smallest_price,'product': product, 'attribute_values_dict': attribute_values_dict})

# def product_detail(request,doll,price1=0,price=0):
#     product=get_object_or_404(Product,slug=doll)
#     variation_names = ['Size', 'Colour']
#     variation_values = ['XL', 'Blue']
# #     variation_item = VariationPriceQuantity.objects.get(
# #     product=product,
# #     variation_name__name__in=variation_names,
# #     variation_value__value__in=variation_values
# # )
#     try:
#         variation_item=VariationPriceQuantity.objects.get(
#             product=product,
#             variation_name__name__in=variation_names,
#             variation_value__value__in=variation_values
#         )
#         print('variation item', variation_item.quantity)
#         print('variation item1', variation_item.price)
#         price=variation_item.price
#     except VariationPriceQuantity.DoesNotExist:
#         print('Variation Price Quantity Tiada')
#         price=None
#     except MultipleObjectsReturned:
#         print('apa ini')
# # Now you can iterate through the variation_items queryset
#     price1=price
#     print('price yes',price1)
#     variations=product.variation_set.all()
#     attribute_values_dict = {}
#     print('variations',variations)
#     # check if the product has any variations
#     if variations.exists():
#         print('variation exists?',variations.exists())
#         # loop through the variations and attributes as before
#         for variation in variations:
#             print('all variation',variation.variation_attribute)
#             for attribute in variation.variation_attribute.all():
#                 attribute_name = attribute.name

#                 if attribute_name not in attribute_values_dict:
#                     attribute_values_dict[attribute_name] = []

#                 values = variation.variation_values.filter(variation_attribute=attribute)
#                 attribute_values_dict[attribute_name].extend(values.values_list('value', flat=True))
#                 print('attribute_name',attribute_name)
#                 print('attribute_values_dict',attribute_values_dict)
#     else:
#         # assign a default value to the attribute_values_dict
#         attribute_values_dict["Variation"] = ["None"]

#     return render(request,'product_detail.html',{'product':product,'attribute_values_dict': attribute_values_dict,})



# def product_detail(request,doll):
#     product=get_object_or_404(Product,slug=doll)
#     variations=product.variation_set.all()
#     attribute_values_dict = {}
    
#     for variation in variations:
#         for attribute in variation.variation_attribute.all():
#             attribute_name = attribute.name

#             if attribute_name not in attribute_values_dict:
#                 attribute_values_dict[attribute_name] = []

#             values = variation.variation_attribute.through.objects.filter(variation=variation, variationattribute=attribute)
#             attribute_values_dict[attribute_name].extend(values.values_list('variationvalue__value', flat=True))
#             print('attribute_name',attribute_name)
#             print('attribute_values_dict',attribute_values_dict)
#     return render(request,'product_detail.html',{'product':product,'attribute_values_dict': attribute_values_dict,})