from django.contrib import admin
from django.urls import path, include
from base import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('about/',views.about,name='about'),
    path('category/', views.store, name='products_all_categories'),
    path('category/<slug:category_slug>/',views.store,name='products_by_category'),
    path('account/login',views.login,name='login'),
    path('account/signup',views.register,name='register'),
    path('account/activate/<uidb64>/<token>/',views.activate,name='activate'),
    path('logout/',views.logout,name='logout'),
    path('cart/',views.cart,name='cart'),
    path('add_cart/<slug:product_slug>/',views.add_cart,name='add_cart'),
    # path('remove_cart/<int:babi>/<int:bunyi>/',views.remove_cart,name='remove_cart'),
    path('cart/updatecart/', views.update_cart, name='update_cart'),
    path('remove_cart_item/<int:lanli>/',views.remove_cart_item,name='remove_cart_item'),
    path('product_detail/<slug:doll>/',views.product_detail,name='product_detail'),
    path('product/applycoupon/',views.coupon_apply,name='coupon_apply'),
    # path('category/<slug:category_slug>/<slug:product_slug>/',views.product_detail,name='products_detail'),
    path('oauth/', include('social_django.urls', namespace='social')),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
