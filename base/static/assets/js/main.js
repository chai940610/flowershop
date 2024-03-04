(function ($) {
	"use strict";
	/*----------------------------------------
	   Sticky Menu Activation
	---------------------------------*/
	$(window).on('scroll', function () {
		if ($(this).scrollTop() > 300) {
			$('.header-sticky').addClass('sticky');
		} else {
			$('.header-sticky').removeClass('sticky');
		}
	});
	/*----------------------------------------
		Off Canvas
	-------------------------------------------*/
	$(".off-canvas-btn").on('click', function () {
		$("body").addClass('fix');
		$(".off-canvas-wrapper").addClass('open');
	});

	$(".btn-close-off-canvas,.off-canvas-overlay").on('click', function () {
		$("body").removeClass('fix');
		$(".off-canvas-wrapper").removeClass('open');
	});

	/*----------------------------------------
		Off Canvas Menu
	-------------------------------------------*/
	$(".off-canvas-menu-btn").on('click', function () {
		$("body").addClass('fix');
		$(".off-canvas-menu-wrapper").addClass('open');
	});

	$(".btn-close-off-canvas,.off-canvas-overlay").on('click', function () {
		$("body").removeClass('fix');
		$(".off-canvas-menu-wrapper").removeClass('open');
	});

	
	/*----------------------------------------*/
	/*  Cart Plus Minus Button this is for cart page
	/*----------------------------------------*/
	
	$(document).ready(function() {
		//declare new global subtotal
		var latestSubtotal=0
		function updateSubtotal($row, quantity) {
			console.log('run first')
			var price = parseFloat($row.data('price'));
			var newSubtotal = price * quantity;
			latestSubtotal=newSubtotal
			$row.find('.pro-subtotal span').text('RM ' + newSubtotal.toFixed(2));
		}
		function recalculateDiscount(){
			console.log('run second')
			//var couponcode=localStorage.getItem
			var current_coupon=localStorage.getItem('appliedCouponCode');
			console.log('current_coupon:', current_coupon, 'Type:', typeof current_coupon);
			//get the coupon
			var latest_subtotal_cart_item=latestSubtotal
			console.log('can subtotal like this?:',latest_subtotal_cart_item)
			//get the total value of all subtotal
			var subtotal1=0
			var couponMessage = document.getElementById('couponmessage');
			var discountpriceElement = document.getElementById('discountprice');
			
			$('.item-subtotal').each(function(){
				var value=parseFloat($(this).text().replace('RM',''));
				if (!isNaN(value)){
					subtotal1+=value;
				}
			});
			console.log('what is the total value now:',subtotal1)
			//then now do the ajax for discount
			if (current_coupon !== null && current_coupon !== "" && current_coupon !== "null"){
				$.ajax({
					type: 'POST',
					url: '/product/applycoupon/',
					data: {
						'couponValue': current_coupon,
						'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val(),
					},
					success: function(data) {
						if (data.success) {
							console.log('run second again')
							console.log('Coupon applied successfully1');
							var allproduct=data.all_product;
							var discount_type=data.discount_type;
							var min_spending=parseFloat(data.min_spending)
							var discount_value=data.discount_value
							var promocode=data.promo_code
							var couponMessage = document.getElementById('couponmessage');
							console.log('is this all product?:',allproduct)
							
							if (allproduct){
								console.log('yes all product bro')
								if (subtotal1>min_spending){
									var latest_discount=0
									console.log('subtotal is greater than min spending')
									//find the latest discount value
									//find see the coupon is percentage or fixed
									if (discount_type === 'percentage'){
										//find the voucher have max discount value or not
										var max_discount_value=parseFloat(data.max_discount)
										console.log('what is the discount value?23:',max_discount_value)
										if (isNaN(max_discount_value)) {
											console.log('yes it null'); // or 'yes it is NaN'
											//now get the latest discount value
											latest_discount=-(parseFloat(subtotal1/100*parseFloat(discount_value)).toFixed(2))
											discountpriceElement.textContent = parseFloat(latest_discount).toFixed(2)
											//now get the subtotal now
											var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
											totalorder=shippingFees+latest_discount+subtotal1
											console.log('latest discount:',latest_discount, 'shipping fees:',shippingFees,'subtotal:',subtotal1)
											console.log('all pro totalorder dis < max Dis:',totalorder)
											$('.total-amount .currency-amount').text(totalorder.toFixed(2));
											couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
											couponMessage.style.color = 'green'; // Correctly set the color
											var popoverTrigger = $('.discount-popover-trigger');
											if (popoverTrigger.data('bs.popover')) {
												popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
											}
											popoverTrigger.addClass('hidden-popover-trigger'); 
										} else {
											console.log('bukan null');
											latest_discount=parseFloat(subtotal1/100*parseFloat(discount_value)).toFixed(2)
											console.log('bumblebee discount:',latest_discount)
											if (max_discount_value < latest_discount){
												var totalorder=0
												latest_discount=-max_discount_value
												couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied. Please note the maximum discount value is RM' + max_discount_value;
												couponMessage.style.color = 'green';
												discountpriceElement.textContent = parseFloat(latest_discount).toFixed(2)
												var popoverTrigger = $('.discount-popover-trigger');
												if (popoverTrigger.data('bs.popover')) {
													popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
												}
												popoverTrigger.addClass('hidden-popover-trigger'); 
											}else{
												var totalorder=0
												latest_discount=-latest_discount
												console.log('what is the late:',latest_discount)
												discountpriceElement.textContent =parseFloat(latest_discount).toFixed(2)
												var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
												totalorder=shippingFees+latest_discount+subtotal1
												console.log('totalorder:',totalorder)
												$('.total-amount .currency-amount').text(totalorder.toFixed(2));
												couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
												couponMessage.style.color = 'green';
												var popoverTrigger = $('.discount-popover-trigger');
												if (popoverTrigger.data('bs.popover')) {
													popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
												}
												popoverTrigger.addClass('hidden-popover-trigger');
											}
										}
									}else{
										//it fixed amount
										if (parseFloat(discount_value)>subtotal1){
											var totalorder=0
											latest_discount=-(subtotal1.toFixed(2))
											discountpriceElement.textContent = parseFloat(latest_discount).toFixed(2)
											console.log('kambing1')
											var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
											totalorder=shippingFees+latest_discount+subtotal1
											console.log('totalorder:',totalorder)
											$('.total-amount .currency-amount').text(totalorder.toFixed(2));
											couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
											//couponMessage.textContent = 'Great! Your ' + promocode + " discount has been applied.Since the voucher's discount value exceeds your subtotal, the discount has not been fully redeemed."
											couponMessage.style.color = 'green';
											var popoverTrigger = $('.hidden-popover-trigger');
											if (popoverTrigger.length > 0) {
												popoverTrigger.removeClass('hidden-popover-trigger'); // This will make it visible
											} else {
												popoverTrigger = $('.discount-popover-trigger');
											}

											if (popoverTrigger.length > 0) {
												// Ensure the popover is not already initialized, or dispose it before reinitializing
												if (popoverTrigger.data('bs.popover')) {
													popoverTrigger.popover('dispose');
												}
												popoverTrigger.attr('data-bs-content', 'The maximum discount for the voucher code '+promocode+' is RM'+discount_value+'. Because your order total is RM'+subtotal1+', your discount has been adjusted to RM'+subtotal1+' to stay within the limit.');
												// Initialize the popover
												new bootstrap.Popover(popoverTrigger[0], {
													container: 'body' // Append the popover to body to avoid positioning issues
												});
											} else {
												// Handle the case where the element does not exist
												console.error('Popover trigger element not found.');
											}
										}else{
											latest_discount=-(parseFloat(discount_value).toFixed(2))
											discountpriceElement.textContent = parseFloat(latest_discount).toFixed(2)
											couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
											couponMessage.style.color = 'green';
											var popoverTrigger = $('.discount-popover-trigger');
											if (popoverTrigger.data('bs.popover')) {
												popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
											}
											popoverTrigger.addClass('hidden-popover-trigger');
										}
									}
								}else{
									var semua=0
									console.log('coupon is invalid, grand total less than min spending')	
									couponMessage.textContent = 'Unfortunately, your coupon is not valid for purchases under ' + 'RM'+min_spending;
        							couponMessage.style.color = 'red'; // Correctly set the color
									discountpriceElement.textContent = parseFloat(0).toFixed(2)
									//recalculate the total
									var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
									console.log('shipping fees10:',shippingFees)
									//get the subtotal
									
									semua=subtotal1+shippingFees
									$('.total-amount .currency-amount').text(semua.toFixed(2));
									var popoverTrigger = $('.discount-popover-trigger');
										if (popoverTrigger.data('bs.popover')) {
											popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
										}
										popoverTrigger.addClass('hidden-popover-trigger');
										localStorage.setItem('appliedCouponCode', null);
								}
							}else{
								console.log('certain product')
								//get the total price for certain product
								var cart_total=0
								var addition_of_sub_total=0
								if (data.applicable_cart_item_ids) {
									data.applicable_cart_item_ids.forEach(function(cartItemId) {
										var cartItemRow = $('tr[data-cart-item-id="' + cartItemId + '"]');
										var itemSubtotalText = cartItemRow.find('.item-subtotal').text();
										var itemSubtotal = parseFloat(itemSubtotalText.replace('RM', '').trim());
										console.log('Subtotal for cart item ' + cartItemId + ': ' + itemSubtotal);
								
										addition_of_sub_total = addition_of_sub_total || 0;
										addition_of_sub_total += itemSubtotal;
									});
									console.log('what is the total price in selected product1:', addition_of_sub_total);
								}
								//okay since you get the total amount of certain product, first check the total amount greater than min spending or not
								//find the full amount of the cart
								var grandTotalText = document.getElementById('grand_total_price').textContent;
								cart_total=parseFloat(grandTotalText)
								console.log('total amount of cart in certain product:',cart_total)
								if (parseFloat(addition_of_sub_total)>min_spending){
									console.log('this voucher is working')
									if (discount_type === 'percentage'){
										//now find this coupon have maximum discount value or not
										var max_discount_value=parseFloat(data.max_discount)
										if (isNaN(max_discount_value)){
											var totalorder=0
											latest_discount=-(parseFloat(addition_of_sub_total/100*parseFloat(discount_value)).toFixed(2))
											discountpriceElement.textContent = parseFloat(latest_discount).toFixed(2)
											var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
											totalorder=shippingFees+latest_discount+cart_total
											$('.total-amount .currency-amount').text(totalorder.toFixed(2));
											couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
											couponMessage.style.color = 'green';
											var popoverTrigger = $('.hidden-popover-trigger');
											if (popoverTrigger.length > 0) {
												popoverTrigger.removeClass('hidden-popover-trigger'); // This will make it visible
											} else {
												popoverTrigger = $('.discount-popover-trigger');
											}

											if (popoverTrigger.length > 0) {
												// Ensure the popover is not already initialized, or dispose it before reinitializing
												if (popoverTrigger.data('bs.popover')) {
													popoverTrigger.popover('dispose');
												}
												popoverTrigger.attr('data-bs-content', 'The promotional code '+promocode+' is designed to offer a '+discount_value+'% discount exclusively on select items within the cart; it does not extend to all products.');
												// Initialize the popover
												new bootstrap.Popover(popoverTrigger[0], {
													container: 'body' // Append the popover to body to avoid positioning issues
												});
											} else {
												// Handle the case where the element does not exist
												console.error('Popover trigger element not found.');
											}
										}else{
											latest_discount=parseFloat(addition_of_sub_total/100*parseFloat(discount_value)).toFixed(2)
											console.log('bumblebee discount1:',latest_discount)
											if (max_discount_value < latest_discount){
												latest_discount=-(max_discount_value)
												discountpriceElement.textContent = parseFloat(latest_discount).toFixed(2)
												couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied. Please note the maximum discount value is RM' + max_discount_value;
												couponMessage.style.color = 'green';
												console.log('helloshima')
												var popoverTrigger = $('.discount-popover-trigger');
												if (popoverTrigger.data('bs.popover')) {
													popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
												}
												popoverTrigger.addClass('hidden-popover-trigger'); 
												//for this one no need change due to the discount value always the same
											}else{
												latest_discount=-latest_discount
												discountpriceElement.textContent = parseFloat(latest_discount).toFixed(2)
												var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
												totalorder=shippingFees+latest_discount+cart_total
												$('.total-amount .currency-amount').text(totalorder.toFixed(2));
												couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
												couponMessage.style.color = 'green';
												var popoverTrigger = $('.hidden-popover-trigger');

												if (popoverTrigger.length > 0) {
													popoverTrigger.removeClass('hidden-popover-trigger'); // This will make it visible
												} else {
													popoverTrigger = $('.discount-popover-trigger');
												}

												if (popoverTrigger.length > 0) {
													// Ensure the popover is not already initialized, or dispose it before reinitializing
													if (popoverTrigger.data('bs.popover')) {
														popoverTrigger.popover('dispose');
													}
													popoverTrigger.attr('data-bs-content', 'The promotional code ' + promocode + ' is applicable exclusively to select items in the cart. As a result, not all products in the cart are eligible for this discount.');
													// Initialize the popover
													new bootstrap.Popover(popoverTrigger[0], {
														container: 'body' // Append the popover to body to avoid positioning issues
													});
												} else {
													// Handle the case where the element does not exist
													console.error('Popover trigger element not found.');
												}
											}
										}
									}else{
										console.log('this is fixed value')
										//now check the discount value and total order
										if (addition_of_sub_total>discount_value){
											latest_discount=-discount_value
											discountpriceElement.textContent = parseFloat(latest_discount).toFixed(2)
											//do mathematics here
											couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
											couponMessage.style.color = 'green';
											var popoverTrigger = $('.discount-popover-trigger');
											if (popoverTrigger.data('bs.popover')) {
												popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
											}
											popoverTrigger.addClass('hidden-popover-trigger'); 
										}else{
											latest_discount=-(addition_of_sub_total)
											discountpriceElement.textContent = parseFloat(latest_discount).toFixed(2)
											var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
											totalorder=shippingFees+latest_discount+cart_total
											$('.total-amount .currency-amount').text(totalorder.toFixed(2));
											couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
											couponMessage.style.color = 'green';
											//seven
											var popoverTrigger = $('.hidden-popover-trigger');
											if (popoverTrigger.length > 0) {
												popoverTrigger.removeClass('hidden-popover-trigger'); // This will make it visible
											} else {
												popoverTrigger = $('.discount-popover-trigger');
											}

											if (popoverTrigger.length > 0) {
												// Ensure the popover is not already initialized, or dispose it before reinitializing
												if (popoverTrigger.data('bs.popover')) {
													popoverTrigger.popover('dispose');
												}
												popoverTrigger.attr('data-bs-content', 'The promo code '+promocode+' is valid only for specific items in the cart. Since the maximum discount offered by the coupon is RM'+discount_value+' and the total cost of the eligible items amounts to RM'+latest_discount+', the discount provided will also be RM'+latest_discount+'.');
												// Initialize the popover
												new bootstrap.Popover(popoverTrigger[0], {
													container: 'body' // Append the popover to body to avoid positioning issues
												});
											} else {
												// Handle the case where the element does not exist
												console.error('Popover trigger element not found.');
											}
										}
									}
								}else{
									console.log('this voucher is not working at all')
									couponMessage.textContent = 'Unfortunately, your coupon is not valid for purchases under ' + 'RM'+min_spending;
        							couponMessage.style.color = 'red'; // Correctly set the color
									discountpriceElement.textContent = parseFloat(0).toFixed(2)
									//recalculate the total
									var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
									console.log('shipping fees10:',shippingFees)
									//get the subtotal
									var grandTotalText = document.getElementById('grand_total_price').textContent;
									// Extract the numerical value from the text content
									var grandTotal = parseFloat(grandTotalText.replace('RM', '').trim());
									console.log('grand_total2', grandTotal);  // Should log the number, e.g., 2636.45
									ultra_grand_total=grandTotal+shippingFees	//no need add discount because discount is zero when coupon invalid
									$('.total-amount .currency-amount').text(ultra_grand_total.toFixed(2));
									var popoverTrigger = $('.discount-popover-trigger');
									if (popoverTrigger.data('bs.popover')) {
										popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
									}
									popoverTrigger.addClass('hidden-popover-trigger'); 
									localStorage.setItem('appliedCouponCode', null);
								}
							}
						} else {
							// Handle cases where the coupon application fails (e.g., invalid coupon)
							console.log('ini error')
							couponMessage.textContent = 'Invalid Coupon';
							couponMessage.style.color = 'red'; // Correctly set the color
							//get the shipping fees
							var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
							//get the current subtotal
							var grandTotalText = document.getElementById('grand_total_price').textContent;
							// Extract the numerical value from the text content
							var grandTotal = parseFloat(grandTotalText.replace('RM', '').trim());
							var ultra_grand_total=grandTotal+shippingFees
							$('.total-amount .currency-amount').text(ultra_grand_total.toFixed(2));
							var popoverTrigger = $('.discount-popover-trigger');
							if (popoverTrigger.data('bs.popover')) {
								popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
							}
							popoverTrigger.addClass('hidden-popover-trigger'); 
							localStorage.setItem('appliedCouponCode', null);
						}
					},
					error: function(xhr, status, error) {
						// Handle AJAX errors
						console.error('Error applying coupon', error);
						couponMessage.textContent = 'Error applying coupon';
						couponMessage.style.color = 'red'; // Correctly set the color
						var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
						//get the current subtotal
						var grandTotalText = document.getElementById('grand_total_price').textContent;
						// Extract the numerical value from the text content
						var grandTotal = parseFloat(grandTotalText.replace('RM', '').trim());
						var ultra_grand_total=grandTotal+shippingFees
						$('.total-amount .currency-amount').text(ultra_grand_total.toFixed(2));
						var popoverTrigger = $('.discount-popover-trigger');
						if (popoverTrigger.data('bs.popover')) {
							popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
						}
						popoverTrigger.addClass('hidden-popover-trigger'); 
						localStorage.setItem('appliedCouponCode', null);
					}
				});
			}
		}
		function calculateTotals(){
			console.log('run third')
			var new_discount_value=0
			var subtotal=0;
			//var shippingFees=parseFloat($('.shipping-fees').text().replace('RM',''))||0;
			var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
			console.log('what is shipping fees:',shippingFees)
			//get the new discount value
			console.log('what is the latest discount value1:',new_discount_value)
			//this is wrong, we need to find the latest discount value
			var discount = parseFloat($('#discountprice').text().replace('RM', '')) || 0;
			console.log('what is the discount yoyo:',discount)
			var grandTotal;
			$('.item-subtotal').each(function(){
				var value=parseFloat($(this).text().replace('RM',''));
				if (!isNaN(value)){
					subtotal+=value;
				}
			});
			grandTotal=subtotal+shippingFees+discount;
			$('.subtotal-amount').text(subtotal.toFixed(2));
        	// Update the Total
        	$('.total-amount .currency-amount').text(grandTotal.toFixed(2));
		}
		function updateCartItemQuantity($row) {
			var quantity = parseInt($row.find('.cart-plus-minus-box').val(), 10);
			var productId = $row.data('product-id');
			
			$.ajax({
				type: 'POST',
				url: '/cart/updatecart/',
				data: {
					'id': productId,
					'quantity': quantity,
					'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
				},
				success: function(data) {
					console.log('Cart updated successfully');
					updateSubtotal($row, quantity);
					recalculateDiscount();
					calculateTotals();
				},
				error: function(error) {
					console.error('Error updating cart', error);
				}
			});
		}
	
		$('.cart-table').on('input change', '.cart-plus-minus-box', function() {
			var $input = $(this);
			var $row = $input.closest('tr');
			var maxQuantity = parseInt($row.data('stock-quantity'), 10);
			var enteredValue = parseInt($input.val(), 10);
	
			if (!isNaN(enteredValue)) {
				if (enteredValue > maxQuantity) {
					$input.val(maxQuantity);
					enteredValue = maxQuantity; // Ensure correct value is used for subsequent operations
					var maxQuantityMessage = "Apologies, the maximum quantity allowed for this product is " + maxQuantity;
					$('#cart-alert1 p').text(maxQuantityMessage);
					$('#cart-alert1').fadeIn().delay(1000).fadeOut();
				}
				$input.data('last-valid', enteredValue);
				updateCartItemQuantity($row);
			} else {
				// Handle case for non-numeric input
				$input.val($input.data('last-valid'));
			}
		});
	
		$('.cart-table').on('click', '.qtybutton', function() {
			var $button = $(this);
			var $row = $button.closest('tr');
			var $input = $row.find('.cart-plus-minus-box');
			var currentVal = parseInt($input.val(), 10);
			var maxQuantity = parseInt($row.data('stock-quantity'), 10);

			// Check if the current value is less than maxQuantity before incrementing
			if ($button.hasClass('inc')) {
				if (currentVal < maxQuantity) {
					$input.val(currentVal + 1);
					updateCartItemQuantity($row);
				} else {
					// If already at maxQuantity, show the alert message
					var maxQuantityMessage = "Apologies, the maximum quantity allowed for this product is " + maxQuantity;
					$('#cart-alert1 p').text(maxQuantityMessage);
					$('#cart-alert1').fadeIn().delay(1000).fadeOut();
				}
			} else if ($button.hasClass('dec') && currentVal > 1) {
				$input.val(currentVal - 1);
				updateCartItemQuantity($row);
			}
		});
		
		
	});
	// document.addEventListener("DOMContentLoaded", function() {
	// 	var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
	// 	var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
	// 		return new bootstrap.Tooltip(tooltipTriggerEl);
	// 	});
	// });
	window.onload = function() {
		// Set appliedCouponCode to null in localStorage when the page loads
		localStorage.setItem('appliedCouponCode', null);
	};
	$(document).ready(function() {
		$('#couponbutton').click(function(e){
			e.preventDefault();
			var couponValue = $('#couponinput').val();
			console.log('What is the coupon value:', couponValue);
	
			// Move the AJAX call inside the click handler
			$.ajax({
				type: 'POST',
				url: '/product/applycoupon/',
				data: {
					'couponValue': couponValue,
					'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
				},
				success: function(data) {
					if (data.success) {
						console.log('Coupon applied successfully');
						// console.log('Applicable Cart Item IDs:', data.applicable_cart_item_ids.join(', '));
						localStorage.setItem('appliedCouponCode', data.promo_code);
						// // Loop through each applicable cart item ID
						console.log('what is inside the data:',data)
						var allproduct = data.all_product;
						var discount_type=data.discount_type
						var min_spending=data.min_spending
						var discount_value=data.discount_value
						var discount=0
						var discount_val_max=0
						var promocode=data.promo_code
						var couponMessage = document.getElementById('couponmessage');
						var discountpriceElement = document.getElementById('discountprice'); // Get the element
						var discountprice = discountpriceElement.textContent; // Get the text content of the element
						console.log('what is the discount price from view:', discountprice);
						console.log('Status all product:', allproduct);
						console.log('what is discount value:',discount_value)
						var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
						console.log('what is shipping fees in voucher:',shippingFees)
						if (discountpriceElement) {
							console.log('Discount price element found:', discountpriceElement);
						} else {
							console.error('Discount price element not found.');
							return; // Exit the function if element is not found
						}

						if (allproduct) {
							console.log('The coupon applies to all products.');
							var grandTotalText = document.getElementById('grand_total_price').textContent;
							console.log('grandTotalText', grandTotalText);  // Should log the text, e.g., "2636.45"
							// Extract the numerical value from the text content
							var grandTotal = parseFloat(grandTotalText.replace('RM', '').trim());
							console.log('grand_total', grandTotal);  // Should log the number, e.g., 2636.45

							// Additional logic for when the coupon applies to all products
							if (discount_type === 'percentage'){
								console.log('this is percentage')
								//now get the grandtotal price
								var discount_val_max=data.max_discount
								console.log('max discount value:',discount_val_max)
								
								//check the grand_total is greater min_spending or not
								if (grandTotal > min_spending){
									console.log('Coupon is valid, more than min spending')
									discount=(grandTotal/100)*discount_value
									console.log('discount value in percentage:',discount)
									// if (Number(discount)>Number(discount_val_max)){
									// 	discount=Number(discount_val_max).toFixed(2);
									// 	console.log('Discount value is over the maximum allowed, discount adjusted to:', discount);
									// }
									discount = parseFloat(discount); 
									discount_val_max = parseFloat(discount_val_max);
									if (isNaN(discount_val_max)){
										//gugu
										discount=discount
										console.log('final discount value without max discount:',discount)
										couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
										couponMessage.style.color = 'green'; // Correctly set the color
										discountpriceElement.textContent = '-' + discount.toFixed(2);
										discountpriceElement.style.color = 'red';
										//do mathematics again
										var semua=grandTotal+shippingFees-discount
										console.log('final total price:',semua)
										$('.total-amount .currency-amount').text(semua.toFixed(2));
										var popoverTrigger = $('.discount-popover-trigger');
										if (popoverTrigger.data('bs.popover')) {
											popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
										}
										popoverTrigger.addClass('hidden-popover-trigger'); 
									}else{
										if (discount > discount_val_max) {
											// Assign the max discount value, but keep it as a number for now
											discount = discount_val_max;
											console.log('final discount value:', discount);
											// Now you convert discount to a string with two decimal places and assign
											couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied. Please note the maximum discount value is RM' + discount_val_max;
											couponMessage.style.color = 'green';
											discountpriceElement.textContent = '-' + discount.toFixed(2);
											discountpriceElement.style.color = 'red';
											//do mathematics
											var semua=grandTotal+shippingFees-discount
											console.log('final total price:',semua)
											$('.total-amount .currency-amount').text(semua.toFixed(2));
											var popoverTrigger = $('.discount-popover-trigger');
											if (popoverTrigger.data('bs.popover')) {
												popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
											}
											popoverTrigger.addClass('hidden-popover-trigger'); 
										} else{
											discount=discount
											console.log('final discount value:',discount)
											couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
											couponMessage.style.color = 'green'; // Correctly set the color
											discountpriceElement.textContent = '-' + discount.toFixed(2);
											discountpriceElement.style.color = 'red';
											//do mathematics again
											var semua=grandTotal+shippingFees-discount
											console.log('final total price:',semua)
											$('.total-amount .currency-amount').text(semua.toFixed(2));
											var popoverTrigger = $('.discount-popover-trigger');
											if (popoverTrigger.data('bs.popover')) {
												popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
											}
											popoverTrigger.addClass('hidden-popover-trigger'); 
											//INI
										}
									}
								}else{
									var semua1=0
									console.log('coupon is invalid, grand total less than min spending')	
									couponMessage.textContent = 'Unfortunately, your coupon is not valid for purchases under ' + 'RM'+min_spending;
        							couponMessage.style.color = 'red'; // Correctly set the color
									discountpriceElement.textContent = parseFloat(0).toFixed(2)
									//recalculate the total
									var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
									console.log('shipping fees10:',shippingFees)
									//get the subtotal
									var grandTotalText = document.getElementById('grand_total_price').textContent;
									// Extract the numerical value from the text content
									var grandTotal = parseFloat(grandTotalText.replace('RM', '').trim());
									console.log('grand_total2', grandTotal);  // Should log the number, e.g., 2636.45
									//ini2
									//do calculation for grand super total
									semua1=shippingFees+grandTotal
									$('.total-amount .currency-amount').text(semua1.toFixed(2));
									var popoverTrigger = $('.discount-popover-trigger');
									if (popoverTrigger.data('bs.popover')) {
										popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
									}
									popoverTrigger.addClass('hidden-popover-trigger');
									localStorage.setItem('appliedCouponCode', null);
								}
							}
							else{
								console.log('this is fixed amount');
								//get the discount value first
								var discount_value1=0
								if (grandTotal>min_spending){
									console.log('yes fixed bigger')
									discount_value1=parseFloat(discount_value)
									if (grandTotal>discount_value1){
										discountpriceElement.textContent =  '-' +discount_value1.toFixed(2);
										discountpriceElement.style.color = 'red';
										var semua1=grandTotal+shippingFees-discount_value
										console.log('so what the total now for fixed:',semua1)
										$('.total-amount .currency-amount').text(semua1.toFixed(2));
										couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
										couponMessage.style.color = 'green';
										var popoverTrigger = $('.discount-popover-trigger');
										if (popoverTrigger.data('bs.popover')) {
											popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
										}
										popoverTrigger.addClass('hidden-popover-trigger'); 
									}else{
										//so now need put question mark on it

										discount_value1=grandTotal;
										discountpriceElement.textContent =  '-' +discount_value1.toFixed(2);
										discountpriceElement.style.color = 'red';
										var semua1=grandTotal+shippingFees-discount_value1
										console.log('so what the total now for fixed:',semua1)
										$('.total-amount .currency-amount').text(semua1.toFixed(2));
										couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
										//couponMessage.textContent = 'Great! Your ' + promocode + " discount has been applied.Since the voucher's discount value exceeds your subtotal, the discount has not been fully redeemed."
										couponMessage.style.color = 'green';
										//kucing1
										var popoverTrigger = $('.hidden-popover-trigger');
										if (popoverTrigger.length > 0) {
											popoverTrigger.removeClass('hidden-popover-trigger'); // This will make it visible
										} else {
											popoverTrigger = $('.discount-popover-trigger');
										}

										if (popoverTrigger.length > 0) {
											// Ensure the popover is not already initialized, or dispose it before reinitializing
											if (popoverTrigger.data('bs.popover')) {
												popoverTrigger.popover('dispose');
											}
											popoverTrigger.attr('data-bs-content', 'The maximum discount for the voucher code '+promocode+' is RM'+discount_value+'. Because your order total is RM'+grandTotal+', your discount has been adjusted to RM'+discount_value1+' to stay within the limit.');
											// Initialize the popover
											new bootstrap.Popover(popoverTrigger[0], {
												container: 'body' // Append the popover to body to avoid positioning issues
											});
										} else {
											// Handle the case where the element does not exist
											console.error('Popover trigger element not found.');
										}
									}
								}else{
									console.log('coupon is invalid, grand total less than min spending')	
									couponMessage.textContent = 'Unfortunately, your coupon is not valid for purchases under ' + 'RM'+min_spending;
        							couponMessage.style.color = 'red'; // Correctly set the color
									discountpriceElement.textContent = parseFloat(0).toFixed(2)
									//recalculate the total
									var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
									console.log('shipping fees10:',shippingFees)
									//get the subtotal
									var grandTotalText = document.getElementById('grand_total_price').textContent;
									// Extract the numerical value from the text content
									var grandTotal = parseFloat(grandTotalText.replace('RM', '').trim());
									console.log('grand_total2', grandTotal);  // Should log the number, e.g., 2636.45
									ultra_grand_total=grandTotal+shippingFees	//no need add discount because discount is zero when coupon invalid
									$('.total-amount .currency-amount').text(ultra_grand_total.toFixed(2));
									var popoverTrigger = $('.discount-popover-trigger');
									if (popoverTrigger.data('bs.popover')) {
										popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
									}
									popoverTrigger.addClass('hidden-popover-trigger'); 
									localStorage.setItem('appliedCouponCode', null);
								}

							}
						}else{
							var grandTotalText = document.getElementById('grand_total_price').textContent;
							console.log('grandTotalText', grandTotalText);  // Should log the text, e.g., "2636.45"
							// Extract the numerical value from the text content
							var grandTotal = parseFloat(grandTotalText.replace('RM', '').trim());
							console.log('grand_total', grandTotal);
							console.log('The coupon applies to selected products only.');
							// Additional logic for when the coupon is for selected products
							//now find the selected product subtotal
							var addition_of_sub_total
							if (data.applicable_cart_item_ids) {
								data.applicable_cart_item_ids.forEach(function(cartItemId) {
									var cartItemRow = $('tr[data-cart-item-id="' + cartItemId + '"]');
									var itemSubtotalText = cartItemRow.find('.item-subtotal').text();
									var itemSubtotal = parseFloat(itemSubtotalText.replace('RM', '').trim());
									console.log('Subtotal for cart item ' + cartItemId + ': ' + itemSubtotal);
							
									addition_of_sub_total = addition_of_sub_total || 0;
									addition_of_sub_total += itemSubtotal;
							
									// var productName = cartItemRow.find('.productname').text().trim();

									// // Normalize the string to ensure uniform spacing and remove excess spaces
									// productName = productName.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim();
									// console.log('apa lanjiao:',productName)
									// var newstr=productName.replace(/\|/g, "");
									// console.log('new str:',newstr)
									// // Split the productName into parts using " | " as the separator
									// var parts = newstr.split(' ');

									// // The first part is the base product name, and the rest are attributes
									// var baseProductName = parts.shift(); // Removes the first element and returns it

									// // Initialize an array to hold formatted attributes
									// var attributes = [];

									// // Since the remaining parts are assumed to be in pairs, process them accordingly
									// while (parts.length > 0) {
									// 	let attributeName = parts.shift(); // Get the next attribute name
									// 	let attributeValue = parts.shift(); // Get the next attribute value
									// 	attributes.push(`${attributeName}: ${attributeValue}`);
									// }

									// // Construct the final product name string with attributes formatted correctly
									// var finalProductName = baseProductName + (attributes.length > 0 ? ", " : "") + attributes.join(' || ');

									// console.log('Final product name:', finalProductName);
								});
								console.log('what is the total price in selected product:', addition_of_sub_total);
							}
							//now check the subtotal got bigger than minumum spending or not
							if (addition_of_sub_total>min_spending){
								console.log('this coupon is for selected product and bigger than min spending')
								//afterward check this is percentage or fixed amount
								if (discount_type === 'percentage'){
									//now find is there any maximum discount value?

									var discount_val_max=data.max_discount
									console.log('max discount value for selected product:',discount_val_max)
									if (isNaN(discount_val_max)){
										console.log('its null')
										discount=(addition_of_sub_total/100)*discount_value
										console.log('lai what discount:',discount)
										//now check this discount greater than discount_val_max or not
										discount = parseFloat(discount);
										discountpriceElement.textContent =  '-' +discount.toFixed(2);
										discountpriceElement.style.color = 'red';
										var semua4=shippingFees-discount+grandTotal
										$('.total-amount .currency-amount').text(semua4.toFixed(2));
										console.log('what is the total amount now1:',semua4)
										couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
										couponMessage.style.color = 'green';
										//kucing3
										
										var popoverTrigger = $('.hidden-popover-trigger');
										if (popoverTrigger.length > 0) {
											popoverTrigger.removeClass('hidden-popover-trigger'); // This will make it visible
										} else {
											popoverTrigger = $('.discount-popover-trigger');
										}

										if (popoverTrigger.length > 0) {
											// Ensure the popover is not already initialized, or dispose it before reinitializing
											if (popoverTrigger.data('bs.popover')) {
												popoverTrigger.popover('dispose');
											}
											popoverTrigger.attr('data-bs-content', 'The promotional code '+promocode+' is designed to offer a '+discount_value+'% discount exclusively on select items within the cart; it does not extend to all products.');
											// Initialize the popover
											new bootstrap.Popover(popoverTrigger[0], {
												container: 'body' // Append the popover to body to avoid positioning issues
											});
										} else {
											// Handle the case where the element does not exist
											console.error('Popover trigger element not found.');
										}
										//gugu1
									}else{
										//babiboo
										console.log('yes got value here')
										//do mathematics now
										discount=(addition_of_sub_total/100)*discount_value
										console.log('lai what discount:',discount)
										//now check this discount greater than discount_val_max or not
										discount = parseFloat(discount); 
										discount_val_max = parseFloat(discount_val_max);
										if (discount>discount_val_max){
											discount=discount_val_max
											discountpriceElement.textContent =  '-' +discount.toFixed(2);
											discountpriceElement.style.color = 'red';
											//now total up all
											var semua2=shippingFees-discount+grandTotal
											// console.log('what is the shipping1:',shippingFees)
											// console.log('what is the subtotal now1:',addition_of_sub_total)
											// console.log('what is the total amount now1:',semua2)
											$('.total-amount .currency-amount').text(semua2.toFixed(2));
											couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied. Please note the maximum discount value is RM' + discount_val_max;
											couponMessage.style.color = 'green';
											var popoverTrigger = $('.discount-popover-trigger');
											if (popoverTrigger.data('bs.popover')) {
												popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
											}
											popoverTrigger.addClass('hidden-popover-trigger'); 
										}else{
											//this part need add the ? to let user understand how discount work
											discount=discount;
											discountpriceElement.textContent =  '-' +discount.toFixed(2);
											discountpriceElement.style.color = 'red';
											var semua3=shippingFees-discount+grandTotal
											$('.total-amount .currency-amount').text(semua3.toFixed(2));
											console.log('what is the total amount now1:',semua3)
											couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
											couponMessage.style.color = 'green';
											//ini needed
											var popoverTrigger = $('.hidden-popover-trigger');

											if (popoverTrigger.length > 0) {
												popoverTrigger.removeClass('hidden-popover-trigger'); // This will make it visible
											} else {
												popoverTrigger = $('.discount-popover-trigger');
											}

											if (popoverTrigger.length > 0) {
												// Ensure the popover is not already initialized, or dispose it before reinitializing
												if (popoverTrigger.data('bs.popover')) {
													popoverTrigger.popover('dispose');
												}
												popoverTrigger.attr('data-bs-content', 'The promotional code ' + promocode + ' is applicable exclusively to select items in the cart. As a result, not all products in the cart are eligible for this discount.');
												// Initialize the popover
												new bootstrap.Popover(popoverTrigger[0], {
													container: 'body' // Append the popover to body to avoid positioning issues
												});
											} else {
												// Handle the case where the element does not exist
												console.error('Popover trigger element not found.');
											}
											
										}
									}
								}else{
									//this is fixed amount with selected product only
									//first find the total amount of selected product
									if (addition_of_sub_total>discount_value){
										discount=discount_value
										discount = parseFloat(discount);
										discountpriceElement.textContent =  '-' +discount.toFixed(2);
										discountpriceElement.style.color = 'red';
										var semua5=shippingFees-discount+grandTotal
										$('.total-amount .currency-amount').text(semua5.toFixed(2));
										console.log('what is the total amount now1:',semua5)
										couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
										couponMessage.style.color = 'green';
										var popoverTrigger = $('.discount-popover-trigger');
										if (popoverTrigger.data('bs.popover')) {
											popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
										}
										popoverTrigger.addClass('hidden-popover-trigger'); 
									}else{
										var discount2=0
										var discount1=0
										discount1=parseFloat(discount_value)
										discount1=discount1.toFixed(2)
										console.log('london1:',discount1)
										discount=parseFloat(addition_of_sub_total)
										//discount = parseFloat(discount);
										discount2=discount.toFixed(2)
										discountpriceElement.textContent =  '-' +discount.toFixed(2);
										discountpriceElement.style.color = 'red';
										var semua6=shippingFees-discount+grandTotal
										$('.total-amount .currency-amount').text(semua6.toFixed(2));
										console.log('what is the total amount now1:',semua6)
										couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
										couponMessage.style.color = 'green';
										// var popoverTrigger = $('.hidden-popover-trigger');
										// popoverTrigger.removeClass('hidden-popover-trigger'); // This will make it visible

										// popoverTrigger.attr('data-bs-content', 'The promo code '+promocode+' is valid only for specific items in the cart. Since the maximum discount offered by the coupon is '+discount1+' and the total cost of the eligible items amounts to '+discount+', the discount provided will also be '+discount+'.');
										// // Reinitialize the popover to apply the new content
										// var popover = new bootstrap.Popover(popoverTrigger[0], {
										// 	container: 'body' // Append the popover to body to avoid positioning issues
										// });
										//kucing4
										
										//JURU
										var popoverTrigger = $('.hidden-popover-trigger');
										if (popoverTrigger.length > 0) {
											popoverTrigger.removeClass('hidden-popover-trigger'); // This will make it visible
										} else {
											popoverTrigger = $('.discount-popover-trigger');
										}

										if (popoverTrigger.length > 0) {
											// Ensure the popover is not already initialized, or dispose it before reinitializing
											if (popoverTrigger.data('bs.popover')) {
												popoverTrigger.popover('dispose');
											}
											popoverTrigger.attr('data-bs-content', 'The promo code '+promocode+' is valid only for specific items in the cart. Since the maximum discount offered by the coupon is RM'+discount1+' and the total cost of the eligible items amounts to RM'+discount2+', the discount provided will also be RM'+discount2+'.');
											// Initialize the popover
											new bootstrap.Popover(popoverTrigger[0], {
												container: 'body' // Append the popover to body to avoid positioning issues
											});
										} else {
											// Handle the case where the element does not exist
											console.error('Popover trigger element not found.');
										}
									}
								}
							}else{
								console.log('coupon is invalid, grand total less than min spending')	
								couponMessage.textContent = 'Unfortunately, your coupon is not valid for purchases under ' + 'RM'+min_spending;
								couponMessage.style.color = 'red'; // Correctly set the color
								discountpriceElement.textContent = parseFloat(0).toFixed(2)
								//recalculate the total
								var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
								console.log('shipping fees10:',shippingFees)
								//get the subtotal
								var grandTotalText = document.getElementById('grand_total_price').textContent;
								// Extract the numerical value from the text content
								var grandTotal = parseFloat(grandTotalText.replace('RM', '').trim());
								console.log('grand_total2', grandTotal);  // Should log the number, e.g., 2636.45
								ultra_grand_total=grandTotal+shippingFees	//no need add discount because discount is zero when coupon invalid
								$('.total-amount .currency-amount').text(ultra_grand_total.toFixed(2));
								localStorage.setItem('appliedCouponCode', null);
								//bobo
								var popoverTrigger = $('.discount-popover-trigger');
								if (popoverTrigger.data('bs.popover')) {
									popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
								}
								popoverTrigger.addClass('hidden-popover-trigger'); 
							}
							
						}
					} else {
						// Handle error or invalid coupon
						console.error(data.error);
						var ultra_grand_total=0
						var couponMessage = document.getElementById('couponmessage');
						couponMessage.textContent = data.error
        				couponMessage.style.color = 'red'; // Correctly set the color
						var discountpriceElement = document.getElementById('discountprice'); // Get the element
						discountpriceElement.textContent = parseFloat(0).toFixed(2)
						//recalculate the total
						var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
						console.log('shipping fees10:',shippingFees)
						//get the subtotal
						var grandTotalText = document.getElementById('grand_total_price').textContent;
						// Extract the numerical value from the text content
						var grandTotal = parseFloat(grandTotalText.replace('RM', '').trim());
						console.log('grand_total2', grandTotal);  // Should log the number, e.g., 2636.45
						ultra_grand_total=grandTotal+shippingFees	//no need add discount because discount is zero when coupon invalid
						console.log('what is the super value:',ultra_grand_total)
						$('.total-amount .currency-amount').text(ultra_grand_total.toFixed(2));
						//the ? sign also need dissapear
						var popoverTrigger = $('.discount-popover-trigger');
						if (popoverTrigger.data('bs.popover')) {
							popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
						}
						popoverTrigger.addClass('hidden-popover-trigger'); 
						localStorage.setItem('appliedCouponCode', null);
					}
				},
				error: function(error) {
					var ultra_grand_total=0
					console.error('Invalid Coupon', error);
					var couponMessage = document.getElementById('couponmessage');
					couponMessage.textContent = data.error
					couponMessage.style.color = 'red'; // Correctly set the color
					var discountpriceElement = document.getElementById('discountprice'); // Get the element
					discountpriceElement.textContent = parseFloat(0).toFixed(2)
					//recalculate the total
					var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
					console.log('shipping fees10:',shippingFees)
					//get the subtotal
					var grandTotalText = document.getElementById('grand_total_price').textContent;
					// Extract the numerical value from the text content
					var grandTotal = parseFloat(grandTotalText.replace('RM', '').trim());
					console.log('grand_total2', grandTotal);  // Should log the number, e.g., 2636.45
					ultra_grand_total=grandTotal+shippingFees	//no need add discount because discount is zero when coupon invalid
					$('.total-amount .currency-amount').text(ultra_grand_total.toFixed(2));
					var popoverTrigger = $('.discount-popover-trigger');
					if (popoverTrigger.data('bs.popover')) {
						popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
					}
					popoverTrigger.addClass('hidden-popover-trigger'); 
					localStorage.setItem('appliedCouponCode', null);
				}
			});
		});
	});



	// $('.qtybutton1').on('click', function () {
	// 	var $button = $(this);
	// 	var oldValue = $button.parent().find('input').val();
	// 	console.log('what is oldValue1',oldValue)
	// 	if ($button.hasClass('inc')) {
	// 		var newVal = parseFloat(oldValue) + 1;
	// 	} else {
	// 		// Don't allow decrementing below zero
	// 		if (oldValue > 1) {
	// 			var newVal = parseFloat(oldValue) - 1;
	// 		} else {
	// 			newVal = 1;
	// 		}
	// 	}
	// 	$button.parent().find('#input2').val(newVal);
	// });

	$('.pro-remove a').on('click', function(event) {
		event.preventDefault(); // Prevent the default link behavior
		var $button = $(this);
		var $row = $button.closest('tr'); // Find the row containing the clicked button
	
		// Get the quantity
		var quantity = parseInt($row.find('.cart-plus-minus-box').val(), 10); // Assumes quantity is always an integer
	
		// Get the product price
		var priceText = $row.find('.pro-price span').text().replace('RM', '').trim(); // Remove the currency symbol and trim any whitespace
		var productPrice = parseFloat(priceText); // Assumes price is formatted correctly as a number
	
		// Now you have both quantity and productPrice for the selected product
		console.log('Quantity:', quantity, 'Product Price:', productPrice);
	
		// Proceed with your AJAX call to remove the item from the cart
		var productId = $row.data('product-id');
		$.ajax({
			type: 'GET',
			url: '/remove_cart_item/' + productId + '/', // Use the correct URL pattern
			success: function(data) {
				console.log('Cart item removed successfully');
				//get the coupon code
				$row.remove(); // Remove the row from the table
				//now get the discount value
				// Here you can also update the UI to reflect the new totals after removal
				//now get the total subtotal
				var remainingcartItems=$('.cart-table tbody tr').length;
				console.log('what the number of cart items now:',remainingcartItems)
				if (remainingcartItems === 0){
					var homeUrlElement = document.getElementById('urls');
					console.log('what is homeurlelement:',homeUrlElement)
					var homeUrl = homeUrlElement ? homeUrlElement.getAttribute('data-home-url') : '/';
					console.log('what is homeURL:',homeUrl)
					var emptyCartHtml = '<div class="empty-cart-message" style="text-align: center; padding: 20px;">' +
						'<p>There are no items in this cart.</p>' +
						'<a href="' + homeUrl + '" class="btn flosun-button primary-btn rounded-0 black-btn">Continue Shopping</a>' +
						'</div>';
						$('.cart-main-wrapper').html(emptyCartHtml);
				}else{
					var super_grand_total=0
					var newsubtotal=0
					var delete_subtotal=0
					delete_subtotal=quantity*productPrice
					console.log('delete_subtotal:',delete_subtotal)
					var grandTotalText = document.getElementById('grand_total_price').textContent;
					console.log('grandTotalText1', grandTotalText);  // Should log the text, e.g., "2636.45"
					// Extract the numerical value from the text content
					var grandTotal = parseFloat(grandTotalText.replace('RM', '').trim());
					console.log('grand_total1', grandTotal);  // Should log the number, e.g., 2636.45
					
					newsubtotal=grandTotal-delete_subtotal
					//fetch this new subtotal to frontend
					//get the shopping fees, discount
					var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
					console.log('what is shipping fees1:',shippingFees)
					//the discount will be tricky, now need to check the COUPON code
					var discount = parseFloat($('#discountprice').text().replace('RM', '')) || 0;
					console.log('what is the discount yoyo1:',discount)
					console.log('super total:',newsubtotal)
					$('#grand_total_price').text(newsubtotal.toFixed(2));
					//made the super_grand_total
					super_grand_total=newsubtotal+shippingFees+discount
					$('.total-amount .currency-amount').text(super_grand_total.toFixed(2));
					var appliedCouponCode = localStorage.getItem('appliedCouponCode'); // Retrieve the coupon code
					console.log('what the coupon code:',appliedCouponCode)
					if (appliedCouponCode !== null && appliedCouponCode !== "" && appliedCouponCode !== "null"){
						$.ajax({
							type: 'POST',
							url: '/product/applycoupon/',
							data: {
								'couponValue': appliedCouponCode,
								'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
							},
							success: function(data) {
								console.log('Coupon recalculated successfully');
								console.log('salam1')
								// now calculate the latest discount value
								console.log('current subtotal value:',newsubtotal)	//this is for allproduct
								//okay now assin new variable
								var promocode=data.promo_code
								var allproduct=data.all_product
								var max_discount=parseFloat(data.max_discount)
								var min_spending=parseFloat(data.min_spending)
								var discount_value=parseFloat(data.discount_value)
								var discounttype=data.discount_type
								var couponMessage = document.getElementById('couponmessage');
								console.log('promocode:',promocode,'allproduct:',allproduct,'max_discount:',max_discount,'min_spending:',min_spending,'discount_value:',discount_value)
								if (allproduct){
									console.log('yes ada all product')
									if (newsubtotal>min_spending){
										if (discounttype === 'percentage'){
											console.log('yes it percentage')
											//now find this voucher have max discount value or not
											var max_discount_value=max_discount
											//then find the discount value
											var discount_value1=(newsubtotal/100*discount_value)
											//then now check see the discount_value1 is greater than max_discount_value or not
											if (isNaN(max_discount_value)){
												//max discount is null
												discount_value1=-discount_value1
												var totalorder=0
												var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
												totalorder=discount_value1+shippingFees+newsubtotal
												$('.total-amount .currency-amount').text(totalorder.toFixed(2));
												var discountpriceElement = document.getElementById('discountprice'); // Get the element
												discountpriceElement.textContent = parseFloat(discount_value1).toFixed(2)
												couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
												couponMessage.style.color = 'green'; // Correctly set the color
												//hide all the popover
												var popoverTrigger = $('.discount-popover-trigger');
												if (popoverTrigger.data('bs.popover')) {
													popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
												}
												popoverTrigger.addClass('hidden-popover-trigger');
											}else{
												//noono
												if (discount_value1>max_discount_value){
													discount_value1=-max_discount_value
													var totalorder=0
													var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
													totalorder=discount_value1+shippingFees+newsubtotal
													$('.total-amount .currency-amount').text(totalorder.toFixed(2));
													var discountpriceElement = document.getElementById('discountprice'); // Get the element
													discountpriceElement.textContent = parseFloat(discount_value1).toFixed(2)
													couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied. Please note the maximum discount value is RM' + max_discount_value;
													couponMessage.style.color = 'green';
													//hide all the popover
													var popoverTrigger = $('.discount-popover-trigger');
													if (popoverTrigger.data('bs.popover')) {
														popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
													}
													popoverTrigger.addClass('hidden-popover-trigger'); 
												}else{
													discount_value1=-discount_value1
													var totalorder=0
													var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
													totalorder=discount_value1+shippingFees+newsubtotal
													$('.total-amount .currency-amount').text(totalorder.toFixed(2));
													var discountpriceElement = document.getElementById('discountprice'); // Get the element
													discountpriceElement.textContent = parseFloat(discount_value1).toFixed(2)
													couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
													couponMessage.style.color = 'green'; // Correctly set the color
													//hide all the popover
													var popoverTrigger = $('.discount-popover-trigger');
													if (popoverTrigger.data('bs.popover')) {
														popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
													}
													popoverTrigger.addClass('hidden-popover-trigger'); 
												} 
											}
										}else{
											console.log('it fixed value')
											if (newsubtotal>discount_value){
												var discount_value1=discount_value
												var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
												totalorder=discount_value1+shippingFees+newsubtotal
												$('.total-amount .currency-amount').text(totalorder.toFixed(2));
												var discountpriceElement = document.getElementById('discountprice'); // Get the element
												discountpriceElement.textContent = parseFloat(discount_value1).toFixed(2)
												couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
												couponMessage.style.color = 'green';
												//hide all the popover
												var popoverTrigger = $('.discount-popover-trigger');
												if (popoverTrigger.data('bs.popover')) {
													popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
												}
												popoverTrigger.addClass('hidden-popover-trigger'); 
											}else{
												var discount_value1=newsubtotal
												var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
												totalorder=discount_value1+shippingFees+newsubtotal
												$('.total-amount .currency-amount').text(totalorder.toFixed(2));
												var discountpriceElement = document.getElementById('discountprice'); // Get the element
												discountpriceElement.textContent = parseFloat(discount_value1).toFixed(2)
												couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
												//couponMessage.textContent = 'Great! Your ' + promocode + " discount has been applied.Since the voucher's discount value exceeds your subtotal, the discount has not been fully redeemed."
												couponMessage.style.color = 'green';
												var popoverTrigger = $('.hidden-popover-trigger');
												if (popoverTrigger.length > 0) {
													popoverTrigger.removeClass('hidden-popover-trigger'); // This will make it visible
												} else {
													popoverTrigger = $('.discount-popover-trigger');
												}

												if (popoverTrigger.length > 0) {
													// Ensure the popover is not already initialized, or dispose it before reinitializing
													if (popoverTrigger.data('bs.popover')) {
														popoverTrigger.popover('dispose');
													}
													popoverTrigger.attr('data-bs-content', 'The maximum discount for the voucher code '+promocode+' is RM'+discount_value+'. Because your order total is RM'+newsubtotal+', your discount has been adjusted to RM'+newsubtotal+' to stay within the limit.');
													// Initialize the popover
													new bootstrap.Popover(popoverTrigger[0], {
														container: 'body' // Append the popover to body to avoid positioning issues
													});
												} else {
													// Handle the case where the element does not exist
													console.error('Popover trigger element not found.');
												}
											}
										}
									}else{
										var ultra_grand_total=0
										console.error('The coupon is invalid because the order value does not meet the minimum spending requirement.')
										
										couponMessage.textContent = 'The coupon is invalid because the order value does not meet the minimum spending requirement.'
										couponMessage.style.color = 'red'; // Correctly set the color
										var discountpriceElement = document.getElementById('discountprice'); // Get the element
										discountpriceElement.textContent = parseFloat(0).toFixed(2)
										//recalculate the total
										var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
										console.log('shipping fees10:',shippingFees)
										ultra_grand_total=newsubtotal+shippingFees	//no need add discount because discount is zero when coupon invalid
										$('.total-amount .currency-amount').text(ultra_grand_total.toFixed(2));
										var popoverTrigger = $('.discount-popover-trigger');
										if (popoverTrigger.data('bs.popover')) {
											popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
										}
										popoverTrigger.addClass('hidden-popover-trigger'); 
										localStorage.setItem('appliedCouponCode', null);
									}
								}else{
									console.log('certain product 950')
									//find the total price after cart item got removed
									var addition_of_sub_total=0
									if (data.applicable_cart_item_ids) {
										data.applicable_cart_item_ids.forEach(function(cartItemId) {
											var cartItemRow = $('tr[data-cart-item-id="' + cartItemId + '"]');
											var itemSubtotalText = cartItemRow.find('.item-subtotal').text();
											var itemSubtotal = parseFloat(itemSubtotalText.replace('RM', '').trim());
											console.log('Subtotal for cart item ' + cartItemId + ': ' + itemSubtotal);
									
											addition_of_sub_total = addition_of_sub_total || 0;
											addition_of_sub_total += itemSubtotal;
										});
										console.log('what is the total price in selected product2:', addition_of_sub_total);
									}
									var discount_value1=0
									if (addition_of_sub_total>min_spending){
										if (discounttype === 'percentage'){
											//check have max discount value or not
											var max_discount_value=max_discount
											//find the discount value
											discount_value1=-(addition_of_sub_total/100*discount_value)
											if (isNaN(max_discount_value)){
												console.log('saya siti null')
												discount_value1=discount_value1
												console.log('siti null discount value:',discount_value1)
												//now check this discount greater than discount_val_max or not
												var discountpriceElement = document.getElementById('discountprice'); // Get the element
												discountpriceElement.textContent =  parseFloat(discount_value1).toFixed(2);
												discountpriceElement.style.color = 'red';
												var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
												var semua4=shippingFees+discount_value1+newsubtotal
												$('.total-amount .currency-amount').text(semua4.toFixed(2));
												console.log('what is the total amount now4:',semua4)
												
												couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
												couponMessage.style.color = 'green';
												//kucing3
												
												var popoverTrigger = $('.hidden-popover-trigger');
												if (popoverTrigger.length > 0) {
													popoverTrigger.removeClass('hidden-popover-trigger'); // This will make it visible
												} else {
													popoverTrigger = $('.discount-popover-trigger');
												}

												if (popoverTrigger.length > 0) {
													// Ensure the popover is not already initialized, or dispose it before reinitializing
													if (popoverTrigger.data('bs.popover')) {
														popoverTrigger.popover('dispose');
													}
													popoverTrigger.attr('data-bs-content', 'The promotional code '+promocode+' is designed to offer a '+discount_value+'% discount exclusively on select items within the cart; it does not extend to all products.');
													// Initialize the popover
													new bootstrap.Popover(popoverTrigger[0], {
														container: 'body' // Append the popover to body to avoid positioning issues
													});
												} else {
													// Handle the case where the element does not exist
													console.error('Popover trigger element not found.');
												}
												
											}else{
												console.log('badminton queen')
												if (discount_value1>max_discount_value){
													discount_value1=max_discount_value
													var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
													var semua4=shippingFees+discount_value1+newsubtotal
													$('.total-amount .currency-amount').text(semua4.toFixed(2));
													couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied. Please note the maximum discount value is RM' + discount_val_max;
													couponMessage.style.color = 'green';
													var popoverTrigger = $('.discount-popover-trigger');
													if (popoverTrigger.data('bs.popover')) {
														popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
													}
													popoverTrigger.addClass('hidden-popover-trigger'); 
												}else{
													discount_value1=discount_value1
													console.log('siti null discount value3:',discount_value1)
													//now check this discount greater than discount_val_max or not
													var discountpriceElement = document.getElementById('discountprice'); // Get the element
													discountpriceElement.textContent =  parseFloat(discount_value1).toFixed(2);
													discountpriceElement.style.color = 'red';
													var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
													var semua4=shippingFees+discount_value1+newsubtotal
													$('.total-amount .currency-amount').text(semua4.toFixed(2));
													console.log('what is the total amount now4:',semua4)
													var couponMessage = document.getElementById('couponmessage');
													couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
													couponMessage.style.color = 'green';
													//kucing3
													
													var popoverTrigger = $('.hidden-popover-trigger');
													if (popoverTrigger.length > 0) {
														popoverTrigger.removeClass('hidden-popover-trigger'); // This will make it visible
													} else {
														popoverTrigger = $('.discount-popover-trigger');
													}

													if (popoverTrigger.length > 0) {
														// Ensure the popover is not already initialized, or dispose it before reinitializing
														if (popoverTrigger.data('bs.popover')) {
															popoverTrigger.popover('dispose');
														}
														popoverTrigger.attr('data-bs-content', 'The promotional code '+promocode+' is designed to offer a '+discount_value+'% discount exclusively on select items within the cart; it does not extend to all products.');
														// Initialize the popover
														new bootstrap.Popover(popoverTrigger[0], {
															container: 'body' // Append the popover to body to avoid positioning issues
														});
													} else {
														// Handle the case where the element does not exist
														console.error('Popover trigger element not found.');
													}
												}
											}
										}else{
											//this is fixed value
											if (addition_of_sub_total>discount_value){
												discount_value1=-discount_value
												//shipping fees
												var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
												var semua4=shippingFees+discount_value1+newsubtotal
												$('.total-amount .currency-amount').text(semua4.toFixed(2));
												couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
												couponMessage.style.color = 'green';
												var popoverTrigger = $('.discount-popover-trigger');
												if (popoverTrigger.data('bs.popover')) {
													popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
												}
												popoverTrigger.addClass('hidden-popover-trigger');
											}else{
												discount_value1=-addition_of_sub_total
												var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
												var semua4=shippingFees+discount_value1+newsubtotal
												$('.total-amount .currency-amount').text(semua4.toFixed(2));
												couponMessage.textContent = 'Great! Your ' + promocode + ' discount has been applied.'
												couponMessage.style.color = 'green';
												var popoverTrigger = $('.hidden-popover-trigger');
												if (popoverTrigger.length > 0) {
													popoverTrigger.removeClass('hidden-popover-trigger'); // This will make it visible
												} else {
													popoverTrigger = $('.discount-popover-trigger');
												}

												if (popoverTrigger.length > 0) {
													// Ensure the popover is not already initialized, or dispose it before reinitializing
													if (popoverTrigger.data('bs.popover')) {
														popoverTrigger.popover('dispose');
													}
													popoverTrigger.attr('data-bs-content', 'The promo code '+promocode+' is valid only for specific items in the cart. Since the maximum discount offered by the coupon is RM'+discount_value+' and the total cost of the eligible items amounts to RM'+addition_of_sub_total+', the discount provided will also be RM'+addition_of_sub_total+'.');
													// Initialize the popover
													new bootstrap.Popover(popoverTrigger[0], {
														container: 'body' // Append the popover to body to avoid positioning issues
													});
												} else {
													// Handle the case where the element does not exist
													console.error('Popover trigger element not found.');
												}
											}
										}
									}else{
										var ultra_grand_total=0
										console.error('The coupon is invalid because the order value does not meet the minimum spending requirement.')
										var couponMessage = document.getElementById('couponmessage');
										couponMessage.textContent = 'The coupon is invalid because the order value does not meet the minimum spending requirement.'
										couponMessage.style.color = 'red'; // Correctly set the color
										var discountpriceElement = document.getElementById('discountprice'); // Get the element
										discountpriceElement.textContent = parseFloat(0).toFixed(2)
										//recalculate the total
										var shippingFees = parseFloat(document.getElementById('shipping1').textContent.replace('RM', '')) || 0;
										console.log('shipping fees10:',shippingFees)
										ultra_grand_total=newsubtotal+shippingFees	//no need add discount because discount is zero when coupon invalid
										$('.total-amount .currency-amount').text(ultra_grand_total.toFixed(2));
										var popoverTrigger = $('.discount-popover-trigger');
										if (popoverTrigger.data('bs.popover')) {
											popoverTrigger.popover('dispose'); // This destroys the existing Popover instance
										}
										popoverTrigger.addClass('hidden-popover-trigger'); 
										localStorage.setItem('appliedCouponCode', null);
									}
								}
							},
							error: function(error) {
								console.error('Error recalculating coupon', error);
							}
						});
					}else{
						console.log('No Coupon input')
					}
				}
				
			},
			error: function(error) {
				console.error('Error removing cart item', error);
			}
		});
	});


	
	

	/*----------------------------------------*/
	/* Toggle Function Active
	/*----------------------------------------*/
	// showlogin toggle
	$('#showlogin').on('click', function () {
		$('#checkout-login').slideToggle(900);
	});
	// showlogin toggle
	$('#showcoupon').on('click', function () {
		$('#checkout_coupon').slideToggle(900);
	});
	// showlogin toggle
	$('#cbox').on('click', function () {
		$('#cbox-info').slideToggle(900);
	});

	// Ship box toggle
	$('#ship-box').on('click', function () {
		$('#ship-box-info').slideToggle(1000);
	});
	/*----------------------------------------
		Responsive Mobile Menu
	------------------------------------------*/
	//Variables
	var $offCanvasNav = $('.mobile-menu'),
	$offCanvasNavSubMenu = $offCanvasNav.find('.dropdown');
	//Add Toggle Button With Off Canvas Sub Menu
	$offCanvasNavSubMenu.parent().prepend('<span class="menu-expand"><i></i></span>');
	//Close Off Canvas Sub Menu
	$offCanvasNavSubMenu.slideUp();
	//Category Sub Menu Toggle
	$offCanvasNav.on('click', 'li a, li .menu-expand', function(e) {
	var $this = $(this);
	if ( ($this.parent().attr('class').match(/\b(menu-item-has-children|has-children|has-sub-menu)\b/)) && ($this.attr('href') === '#' || $this.hasClass('menu-expand')) ) {
		e.preventDefault();
		if ($this.siblings('ul:visible').length){
			$this.parent('li').removeClass('active');
			$this.siblings('ul').slideUp();
		} else {
			$this.parent('li').addClass('active');
			$this.closest('li').siblings('li').removeClass('active').find('li').removeClass('active');
			$this.closest('li').siblings('li').find('ul:visible').slideUp();
			$this.siblings('ul').slideDown();
		}
	}
	});

	/*----------------------------------------
		Swiper Slider Activation Js
	------------------------------------------*/
	// Home 01 Slider
	var intro11Slider = new Swiper('.intro11-slider', {
        loop: true,
        speed: 400,
		slidesPerView: 1,
        spaceBetween: 10,
		effect: 'fade',
        navigation: {
            nextEl: '.home1-slider-next',
            prevEl: '.home1-slider-prev',
		},
		pagination: {
			el: '.swiper-pagination',
			type: 'bullets',
			clickable: 'true',
		},
		//autoplay: {},
	});
	// Product Carousel
	var intro11Slider = new Swiper('.product-slider', {
		slidesPerView: 1,
		spaceBetween: 10,
		pagination: {
			el: '.swiper-pagination',
			type: 'bullets',
			clickable: 'true',
		},
		//autoplay: {},
		// Responsive breakpoints
		breakpoints: {
			// when window width is >= 320px
			320: {
			  slidesPerView: 1,
			  spaceBetween: 10
			},
			// when window width is >= 480px
			480: {
			  slidesPerView: 2,
			  spaceBetween: 10
			},
			// when window width is >= 767px
			768: {
			  slidesPerView: 3,
			  spaceBetween: 10
			},
			// when window width is >= 1200px
			1200: {
				slidesPerView: 4,
				spaceBetween: 10
			  },
		  }
	});
	// item Carousel 2
	var intro11Slider = new Swiper('.item-carousel-2', {
		slidesPerView: 1,
		autoHeight: true,
		pagination: {
			el: '.swiper-pagination',
			type: 'bullets',
			clickable: 'true',
		},
		//autoplay: {},
		// Responsive breakpoints
		breakpoints: {
			// when window width is >= 480px
			480: {
			  slidesPerView: 1,
			},
			// when window width is >= 575px
			575: {
			  slidesPerView: 2,
			},
			// when window width is >= 767px
			767: {
			  slidesPerView: 2,
			},
			// when window width is >= 991px
			991: {
				slidesPerView: 2,
			},
			// when window width is >= 1200px
			1200: {
				slidesPerView: 3,
			  },
		  }
	});
	// Brand Logo Carousel
	var intro11Slider = new Swiper('.brand-logo-carousel', {
		loop: true,
        speed: 800,
		slidesPerView: 1,
        spaceBetween: 10,
		effect: 'slide',
        navigation: {
            nextEl: '.home1-slider-next',
            prevEl: '.home1-slider-prev',
		},
		//autoplay: {},
		// Responsive breakpoints
		breakpoints: {
			// when window width is >= 320px
			320: {
			  slidesPerView: 2,
			},
			// when window width is >= 480px
			480: {
			  slidesPerView: 2,
			},
			// when window width is >= 575px
			575: {
			  slidesPerView: 3,
			},
			// when window width is >= 767px
			767: {
			  slidesPerView: 4,
			},
			// when window width is >= 991px
			991: {
				slidesPerView: 4,
			},
			// when window width is >= 1200px
			1200: {
				slidesPerView: 5,
			  },
		  }
	});
	// Testimonial Carousel
	var intro11Slider = new Swiper('.testimonial-carousel', {
        loop: true,
        speed: 800,
		slidesPerView: 1,
        spaceBetween: 10,
		effect: 'slide',
        navigation: {
            nextEl: '.home1-slider-next',
            prevEl: '.home1-slider-prev',
		},
		//autoplay: {},

	});
	// Latest Post Carousel
	var intro11Slider = new Swiper('.latest-post-carousel', {
        loop: true,
		direction: 'vertical',
		slidesPerView: 3,
		mousewheel: true,
		pagination: {
			el: '.swiper-pagination',
			clickable: true,
		},
		//autoplay: {},
		

	});
	// Single product with Thumbnail
	var galleryThumbs = new Swiper('.single-product-thumb', {
		spaceBetween: 10,
		slidesPerView: 4,
		loop: false,
		freeMode: true,
		loopedSlides: 5, //looped slides should be the same
		watchSlidesVisibility: true,
		watchSlidesProgress: true,
		// Responsive breakpoints
		breakpoints: {
			// when window width is >= 320px
			320: {
			  slidesPerView: 2,
			},
			// when window width is >= 575px
			575: {
			  slidesPerView: 3,
			},
			// when window width is >= 767px
			767: {
			  slidesPerView: 4,
			},
			// when window width is >= 991px
			991: {
				slidesPerView: 3,
			},
			// when window width is >= 1200px
			1200: {
				slidesPerView: 4,
			},
		  }
	  });
	var galleryTop = new Swiper('.single-product-img', {
	spaceBetween: 10,
	loop: false,
	loopedSlides: 5, //looped slides should be the same
	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev',
	},
	thumbs: {
		swiper: galleryThumbs,
	},
	});

	document.addEventListener('DOMContentLoaded', function () {	//made sure the code inside the function will run when the HTML document is fully loaded
		// var csrfTokenInput = document.querySelector('input[name=csrfmiddlewaretoken]');
		// var csrfToken = document.querySelector('input[name=csrfmiddlewaretoken]').value;
		var loggedInState=document.getElementById('userState').getAttribute('data-logged-in') === 'True';
		var errorSpan = document.getElementById('error');
		var errorSpan1 = document.getElementById('error1');
		var csrfTokenInput = document.querySelector('input[name=csrfmiddlewaretoken]');
		var attributeContainers=document.querySelectorAll('.attribute-container span');
		var addCartButton=document.getElementById('add_cart');
		var addCartButton1=document.getElementById('add_cart1');
		var wishlist=document.getElementById('wishlist');
		var attributeNames = Array.from(attributeContainers).map(function (span) {
			return span.textContent.trim();
		});
		var quantity2 = document.getElementById('quantity1');	//get the total quantity of product without variation
		var inputElement1=document.getElementById('input3');
		var inputElement=document.getElementById('input2');
		if (quantity2){
			var quantityText = quantity2.textContent.trim();
			var quantityValue = quantityText.match(/\d+/); // This regex matches one or more digits
			console.log('what is quantityvalue',quantityValue)
			var productquantitywithoutvariation=quantityValue[0]
		}
		console.log('productquantitywithoutvariation',productquantitywithoutvariation)
		console.log('what is current attribute name?',attributeNames)
		//good news, it return what is current attribute name? (2) ['Colour', 'Size']
		if (csrfTokenInput){
			var csrfToken=csrfTokenInput.value;
			console.log('CSRF Token',csrfToken)
		}else{
			console.log('CSRF Token input element not found.')
		}
		var buttons = document.querySelectorAll('.attribute-values button');
		// Get value from active
		var activeValues = [];
		var activeAttributes = [];
		
		var productSlug = window.location.pathname.split('/').filter(Boolean).pop();	//understand how this thing work?
		//example the url is http://localhost:8000/product_detail/susu/, the split '/' will like this ["", "product_detail", "susu", ""] then filter(Boolean), the boolean is a callback function it return true or false, when it use filter, it remove the falsy value from the array, in this case it remove the empty string ["product_detail", "susu"], and pop is the last element of the array, which is susu
		console.log('product slug',productSlug)
		$('.qtybutton1').on('click', function () {
			console.log('active1', activeValues.length);
			console.log('attributename1', attributeNames.length);
			if (activeValues.length !== attributeNames.length) {
				errorSpan.textContent = 'Please select the variations before adjusting quantity.';
				errorSpan.style.color = 'red';
			}
		});
		$('.qtybutton2').on('click', function () {
			console.log('testing10');
			var $button = $(this);
			var productQuantity = productquantitywithoutvariation;
			var oldValue = $button.parent().find('input').val();
			var newVal;
			if ($button.hasClass('inc')) {
				var newVal = parseFloat(oldValue) + 1;
				if (newVal <= productQuantity) {
					$button.parent().find('#input3').val(newVal);
					// Clear the error message when the user increments
					errorSpan1.textContent = '';
				} else {
					// Display an error message if the maximum quantity is reached
					errorSpan1.textContent = 'The maximum quantity for this item is ' + productQuantity;
					errorSpan1.style.color = 'red';
					newVal = productQuantity;
				}
			} else {
				// Don't allow decrementing below zero
				if (oldValue > 1) {
					var newVal = parseFloat(oldValue) - 1;
					errorSpan1.textContent = '';
				} else {
					newVal = 1;
				}
			}
			$button.parent().find('#input3').val(newVal);
			
		});
		if (inputElement){
			inputElement.disabled=true;
		}
		if (inputElement1){
			inputElement1.addEventListener('input', function () {
				var enteredValue = parseFloat(inputElement1.value);
				if (isNaN(enteredValue)) {
					inputElement1.value = 1;
				} else {
					inputElement1.value = Math.min(enteredValue, productquantitywithoutvariation);
				}
			});
		}
		if (addCartButton){
			addCartButton.addEventListener('click',function(event){
				if (activeValues.length != attributeNames.length){
					event.preventDefault();
					errorSpan.textContent='Please select the variations before adding to cart.'
					errorSpan.style.color = 'red'; // Set the font color to red
				}
			})
		}

		if (addCartButton1){
			document.getElementById('add_cart1').addEventListener('click', function(event) {
				event.preventDefault();
				if (!loggedInState) {
					// Redirect to login page
					//window.location.href = "/account/login";
					window.location.href = "/account/login?next=" + encodeURIComponent(window.location.pathname) + "&loginMessage=true";
					return; // Prevent further execution
				}
				console.log('add to cart1')
				var quantity1 = inputElement1.value
				console.log('inputelement1:',quantity1)
				var csrfToken = document.querySelector('input[name=csrfmiddlewaretoken]').value;
				var jsonData = JSON.stringify({ quantity1: quantity1 });
				// console.log('what is the quantity without variation?:'quantity1)
				var xhr = new XMLHttpRequest();
				xhr.open("POST", "/add_cart/" + productSlug + "/", true);
				xhr.setRequestHeader("Content-Type", "application/json");
				xhr.setRequestHeader("X-CSRFToken", csrfToken);
			
				xhr.onreadystatechange = function() {
					if (xhr.readyState === XMLHttpRequest.DONE) {
						try {
							var response = JSON.parse(xhr.responseText);
							if (xhr.status === 200) {
								console.log('Data sent successfully');
								$('#cart-alert').fadeIn();
								setTimeout(function() {
								$('#cart-alert').fadeOut();
							}, 3000);
								//alert(response.message); // Optionally, use a more user-friendly way to show success
							} else {
								// Error or other non-successful status codes
								console.error("Error: " + response.message);
								document.getElementById('error1').textContent = response.message;
								document.getElementById('error1').style.color = 'red';
							}
						} catch (error) {
							console.error("Error parsing JSON response: " + error.message);
						}
					}
				};
			
				xhr.send(jsonData);
			});
		}

		if (wishlist){
			wishlist.addEventListener('click',function(event){
				if (activeValues.length != attributeNames.length){
					event.preventDefault();
					errorSpan.textContent='Please select the variations before adding to wishlist.'
					errorSpan.style.color = 'red'; // Set the font color to red
				}
			})
		}
		
		buttons.forEach(function (button) {
			button.addEventListener('click', function () {
				// Get the attribute name of the clicked button
				var attribute = button.parentElement.previousElementSibling.textContent.trim();
	
				// Remove the 'active' class from all other buttons with the same attribute name
				buttons.forEach(function (otherButton) {
					var otherAttribute = otherButton.parentElement.previousElementSibling.textContent.trim();
					if (otherAttribute === attribute && otherButton !== button) {
						otherButton.classList.remove('active');
					}
				});
	
				// If the button is already active, remove the 'active' class
				if (button.classList.contains('active')) {
					button.classList.remove('active');
					removeValueFromArrays(attribute, button.querySelector('strong').textContent);
				} else {
					// Toggle the 'active' class on the clicked button
					button.classList.add('active');
	
					// If the button is now active, add the value and attribute to the arrays
					var value = button.querySelector('strong').textContent;
					addValueToArrays(attribute, value);
				}
	
				// Log active values and attributes
				console.log('Active Values:', activeValues);
				console.log('Active Attributes:', activeAttributes);
				//for testing purpose
				console.log('activeValues3 number',activeValues.length)
				console.log('number of attribute1',attributeNames.length)
				if (activeValues.length !=attributeNames.length){
					console.log('testing4')
				}
			
				sendDataToServer(activeAttributes,activeValues,productSlug,csrfToken);
			});
		});
		console.log('activeValues2 number',activeValues.length)
		console.log('number of attribute',attributeNames.length)
		if (activeValues.length !=attributeNames.length){
			console.log('testing3')
		}

		// Helper function to add a value to the arrays
		function addValueToArrays(attribute, value) {	//if the attribute already exists, then add the value, if it return -1, which mean the attribute didn't exist, so add
			var index = activeAttributes.indexOf(attribute);
			if (index !== -1) {
				// If the attribute already exists, update the value
				activeValues[index] = value;
			} else {
				// If the attribute doesn't exist, add it
				activeAttributes.push(attribute);
				activeValues.push(value);
			}
		}
	
		// Helper function to remove a value from the arrays
		function removeValueFromArrays(attribute, value) {
			var attributeIndex = activeAttributes.indexOf(attribute);
			if (attributeIndex !== -1) {
				activeAttributes.splice(attributeIndex, 1);	//use splice to remove the element of the activeAttributes
				activeValues.splice(attributeIndex, 1);
			}
		}
	});
	function sendDataToServer(attributes, values, productSlug, csrfToken) {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "/product_detail/" + productSlug + "/", true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.setRequestHeader("X-CSRFToken", csrfToken);
		var errorSpan=document.getElementById('error');
		var quantitySpan = document.getElementById('quantity');
		var jsonData = JSON.stringify({ attributes: attributes, values: values })
		var inputElement = document.getElementById('input2');
		xhr.onreadystatechange = function () {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				if (xhr.status === 200) {
					console.log("Data sent successfully");
					try {
						var response = JSON.parse(xhr.responseText);
						if (response.variation_price_quantity || response.counter1) {
							var variationPriceQuantity1 = response.variation_price_quantity;
							updateFrontend(response.variation_price_quantity, attributes, values,productSlug);
						}
					} catch (error) {
						console.error("No Variation matched:", error);
						quantitySpan.textContent = "";
						errorSpan.textContent="";
						$('.quantity-with_btn .qtybutton1').prop('disabled',true);
						if (inputElement) { // Check if the inputElement exists before attempting to modify it
							inputElement.disabled = true; // Disable the input element to prevent user input
							inputElement.value=1;
						}
					}
					
				} else {
					console.error("Error sending data:", xhr.statusText);
				}
			}
		};
	
		xhr.send(jsonData);
	}
	
	//document.addEventListener('DOMContentLoaded', function ()
	
	function slideToMatchingImage(imageUrls) {
		var swiperSlides = document.querySelectorAll('.single-product-img .swiper-slide img');
		// Assuming imageUrl is an array and we're interested in the first URL
		var targetImageUrl = imageUrls[0];
		console.log('what is targetImageUrl:', targetImageUrl);
		console.log('what is inside swiperSlides:', swiperSlides);
		
		swiperSlides.forEach(function(img, index) {
			console.log('what is src', img.currentSrc); 
			var imagePath = new URL(img.currentSrc).pathname;
        	console.log('Path after domain:', imagePath);      
			// Normalize the target image URL path for comparison
			var normalizedTargetImagePath = new URL(targetImageUrl, window.location.href).pathname;
			console.log('normalizedTargetImagePath:',normalizedTargetImagePath)
			if (imagePath === normalizedTargetImagePath) {
				console.log('yes they are the same');
				galleryTop.slideTo(index); // Slide to the matching image
				return; // Found the matching image, exit the function
			}
		});
	}

	function updateFrontend(variationPriceQuantity,attributes1,values1,productSlug1) {
		console.log("updated variation price quantity:", variationPriceQuantity);
		console.log('updated variation price quantity', variationPriceQuantity.quantity);
		var regularPriceSpan = document.getElementById('regularPrice');
		var priceBox = document.querySelector('.price-box');
		var quantitySpan=document.getElementById('quantity')
		console.log('what is quantitySpan',quantitySpan)
		var cartButton = document.getElementById('add_cart');
		var wishlistButton = document.getElementById('wishlist');
		var errorSpan=document.getElementById('error');
		var maxQuantity2
		
		//var inputElementId = 'input_' + attributes1.join('_');
		//var errorSpan = document.getElementById('error');
		//var quantityContainer = document.querySelector('.quantity-with_btn');
		// Check if the elements exist before updating
		console.log('what is the variationpricequantity?',variationPriceQuantity.quantity)
		var inputElement=document.getElementById('input2');
		var maxquantity1=variationPriceQuantity.quantity
		console.log('current max quantity',maxquantity1)
		//inputElement.value=1;
		var inputEventListenerAdded = false;
		//first action
		$('.quantity-with_btn .qtybutton1').prop('disabled',false);
		//second action is update the image for selected image
		if (variationPriceQuantity && variationPriceQuantity.image_urls && variationPriceQuantity.image_urls.length > 0) {
			console.log('variationPriceQuantity.image_urls:',variationPriceQuantity.image_urls)
			slideToMatchingImage(variationPriceQuantity.image_urls); // Assuming the first URL is the primary image for the variation
		}
		//third action let the inputElement works
		if(inputElement){
			inputElement.disabled = false;
		}

		if (priceBox && regularPriceSpan) {
			// Create a new span for old price
			// Check if discount_price exists
			if (variationPriceQuantity.discount_price) {
				// If discount_price exists, remove oldPriceSpan if it exists
				// Update regular price when discount_price exists
				var oldPriceSpan = document.querySelector('.old-price');
				if (oldPriceSpan && priceBox.contains(oldPriceSpan)) {
					priceBox.removeChild(oldPriceSpan);
				}

				regularPriceSpan.innerHTML = 'RM' + variationPriceQuantity.discount_price;
			
				var newOldPriceSpan = document.createElement('span');
				newOldPriceSpan.classList.add('old-price');
				var delElement = document.createElement('del');
				delElement.textContent = 'RM' + variationPriceQuantity.price;
				newOldPriceSpan.appendChild(delElement);
				priceBox.appendChild(newOldPriceSpan);
			} else {
				// If discount_price doesn't exist, remove oldPriceSpan if it exists
				console.log("variation discount abc")
				
				var oldPriceSpan = document.querySelector('.old-price');
				if (oldPriceSpan && priceBox.contains(oldPriceSpan)) {
					priceBox.removeChild(oldPriceSpan);
				}
				// Update regular price only when discount_price doesn't exist
				regularPriceSpan.textContent = 'RM' + variationPriceQuantity.price;
			}
			if (variationPriceQuantity.quantity) {  //if the quantity exist which mean is more than 0
				// Display the quantity in the quantitySpan
				//for inputElement
				
				//if (!maxQuantityList.includes(variationPriceQuantity.quantity)) {
				//    maxQuantityList.push(variationPriceQuantity.quantity);
				//}
				//console.log('quantity for input element:',maxQuantityList)
				console.log("run this");
				console.log('salam attributes length',attributes1.length)
				console.log('salam values length',values1.length)
				if (attributes1.length === values1.length){
					$('.quantity-with_btn').off('click', '.qtybutton1').on('click', '.qtybutton1', function () {
						var $button = $(this);
						var oldValue = $button.parent().find('input').val();
						var maxQuantity = variationPriceQuantity.quantity;
					
						if ($button.hasClass('inc')) {
							var newVal = parseFloat(oldValue) + 1;
							if (newVal <= maxQuantity) {
								$button.parent().find('#input2').val(newVal);
								// Clear the error message when the user increments
								errorSpan.textContent = '';
							} else {
								// Display an error message if the maximum quantity is reached
								errorSpan.textContent = 'The maximum quantity for this item is ' + maxQuantity;
								errorSpan.style.color = 'red';
								newVal = maxQuantity;
							}
						} else {
							// Don't allow decrementing below zero
							if (oldValue > 1) {
								var newVal = parseFloat(oldValue) - 1;
								errorSpan.textContent="";
							} else {
								newVal = 1;
							}
						}
					
						// Only update the input value when variation quantity exists
						$button.parent().find('#input2').val(newVal);
					});
					quantitySpan.textContent = variationPriceQuantity.quantity + " pieces available";
				}else{
					console.log('do nothing')
					//quantitySpan.textContent = "";
					//errorSpan.textContent="";
				}
				//quantitySpan.textContent = variationPriceQuantity.quantity + " pieces available";
				cartButton.style.display = 'inline-block';
				wishlistButton.style.display = 'inline-block';
				console.log("run this 1");
				errorSpan.textContent=''
				// Check if quantityContainer already exists
				var quantityContainer = document.querySelector('.quantity');
				console.log('what is quantity',quantityContainer)   //okay the quantityContainer is the <div class="quantity">
				console.log('what is !quantityContainer',!quantityContainer)    //check the div quantity is exists or not
					if (!quantityContainer) {
						console.log('add container')
					// Create the outer container div with class "quantity"
					quantityContainer = document.createElement('div');
					quantityContainer.classList.add('quantity');
			
					// Create the inner div with class "cart-plus-minus"
					var cartPlusMinusDiv = document.createElement('div');
					cartPlusMinusDiv.classList.add('cart-plus-minus');
			
					// Create the input element with class "cart-plus-minus-box"
					var inputElement = document.createElement('input');
					inputElement.classList.add('cart-plus-minus-box');
					inputElement.value = '1';
					inputElement.type = 'number';
					inputElement.id='input2';
					//inputElement.disabled = false;
					// Create the "dec" button div with class "dec qtybutton"
					var decButton = document.createElement('div');
					decButton.classList.add('dec', 'qtybutton1');
					var decIcon = document.createElement('i');
					decIcon.classList.add('fa', 'fa-minus');
					decButton.appendChild(decIcon);
			
					// Create the "inc" button div with class "inc qtybutton"
					var incButton = document.createElement('div');
					incButton.classList.add('inc', 'qtybutton1');
					var incIcon = document.createElement('i');
					incIcon.classList.add('fa', 'fa-plus');
					incButton.appendChild(incIcon);
			
					// Append child elements to build the structure
					cartPlusMinusDiv.appendChild(inputElement);
					cartPlusMinusDiv.appendChild(decButton);
					cartPlusMinusDiv.appendChild(incButton);
			
					quantityContainer.appendChild(cartPlusMinusDiv);
			
					// Append quantityContainer to your document or wherever needed
					// For example, assuming there's a parent container with class "quantity-with_btn"
					var parentContainer = document.querySelector('.quantity-with_btn');
					//parentContainer.appendChild(quantityContainer);
					

					// Insert quantityContainer before the add-to-cart button
					parentContainer.insertBefore(quantityContainer, document.querySelector('.add-to_cart'));
					console.log('Quantity container added');

					
				}else{
					inputElement.value=1;
				}
				console.log('hello1')
					// Store the initial quantity

				
				console.log('what is maxquantity now',variationPriceQuantity.quantity)
				function updateMaxQuantityAttribute(maxQuantity) {
					var inputElement = document.getElementById('input2');
					if (inputElement) {
						inputElement.setAttribute('data-max-quantity', maxQuantity);
					}
				}
				
				document.querySelector('.quantity-with_btn').addEventListener('input', function(event) {    //the 'input' in this line fired every time whtn the user changes the value of an input, such as typing
					if (event.target && event.target.id === 'input2') {
						var maxQuantity = event.target.getAttribute('data-max-quantity');
						var inputValue = Number(event.target.value);
						
						console.log('Input event: current input value', inputValue, 'maxQuantity', maxQuantity);
						
						if (inputValue < 1) {
							event.target.value = 1;
						} else if (inputValue > maxQuantity) {
							event.target.value = maxQuantity;
						}
					}
				});
				
				// Call this function whenever you update the variationPriceQuantity.quantity
				updateMaxQuantityAttribute(variationPriceQuantity.quantity);
			} else {
				// If quantity doesn't exist, clear the content of quantitySpan
				console.log('hello3')
				quantitySpan.textContent = 'Out of Stock';
				cartButton.style.display = 'none';
				wishlistButton.style.display = 'none';
				//errorSpan.textContent='Hello';
				// Check if quantityContainer exists and remove it
				var quantityContainer = document.querySelector('.quantity');
				if (quantityContainer) {
					quantityContainer.remove();
					inputElement.disabled=false;
					console.log('Quantity container removed');
				}
				console.log('hello2')
			
			}
			document.getElementById('add_cart').addEventListener('click', function(event) {
				event.preventDefault();
				var loggedInState=document.getElementById('userState').getAttribute('data-logged-in') === 'True';	//got what this mean? it equal true when user is login
				if (!loggedInState) {
					// Redirect to login page
					//window.location.href = "/account/login";
					window.location.href = "/account/login?next=" + encodeURIComponent(window.location.pathname) + "&loginMessage=true";
					return; // Prevent further execution
				}
				var attributes = attributes1; 
				var values = values1;
				var quantity = document.getElementById('input2').value; 
				var csrfToken = document.querySelector('input[name=csrfmiddlewaretoken]').value;
				var jsonData = JSON.stringify({ attributes: attributes, values: values, quantity: quantity });
			
				var xhr = new XMLHttpRequest();
				xhr.open("POST", "/add_cart/" + productSlug1 + "/", true);
				xhr.setRequestHeader("Content-Type", "application/json");

				xhr.setRequestHeader("X-CSRFToken", csrfToken);
			
				xhr.onreadystatechange = function() {
					if (xhr.readyState === XMLHttpRequest.DONE) {
						var response;
						try {
							response = JSON.parse(xhr.responseText);
							
						} catch (error) {
							console.error("Error parsing JSON response: " + error.message);
							return;
						}
				
						if (xhr.status === 200) {
							console.log('Data sent successfully');
							$('#cart-alert').fadeIn();
							setTimeout(function() {
								$('#cart-alert').fadeOut();
							}, 3000);
						} else {
							console.error("Error: " + response.message);
							document.getElementById('error').textContent = response.message;
							document.getElementById('error').style.color = 'red';
						}
					}
				};
			
				xhr.send(jsonData);
			});
		}
	}

	/*----------------------------------------*/
	/*  Shop Grid Activation
	/*----------------------------------------*/
	$('.shop_toolbar_btn > button').on('click', function (e) {
	
		e.preventDefault();
		
		$('.shop_toolbar_btn > button').removeClass('active');
		$(this).addClass('active');
		
		var parentsDiv = $('.shop_wrapper');
		var viewMode = $(this).data('role');
		
		
		parentsDiv.removeClass('grid_3 grid_4 grid_5 grid_list').addClass(viewMode);

		if(viewMode == 'grid_3'){
			parentsDiv.children().addClass('col-lg-4 col-md-6 col-sm-6').removeClass('col-lg-3 col-cust-5 col-12');
			
		}

		if(viewMode == 'grid_4'){
			parentsDiv.children().addClass('col-lg-3 col-md-6 col-sm-6').removeClass('col-lg-4 col-cust-5 col-12');
		}
		
		if(viewMode == 'grid_list'){
			parentsDiv.children().addClass('col-12').removeClass('col-lg-3 col-lg-4 col-md-6 col-sm-6 col-cust-5');
		}
			
	});
	/*--------------------------------
	Price Slider Active
	-------------------------------- */
	$( "#slider-range" ).slider({
        range: true,
        min: 0,
        max: 500,
        values: [ 0, 500 ],
        slide: function( event, ui ) {
        $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
       }
    });
    $( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
       " - $" + $( "#slider-range" ).slider( "values", 1 ) );
	/*----------------------------------------
		Bootstrap 5 Tooltip
	------------------------------------------*/
	// $(function () {
	// 	$('[data-toggle="tooltip"]').tooltip();
	// });
	document.addEventListener("DOMContentLoaded", function() {
		var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
		var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
			return new bootstrap.Tooltip(tooltipTriggerEl, {
				html: true // This enables HTML content inside the tooltip
			});
		});
	});

	document.addEventListener("DOMContentLoaded", function() {
		var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
		var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
			return new bootstrap.Popover(popoverTriggerEl);
		});
	});
	/*----------------------------------------*/
	/*  Countdown
	/*----------------------------------------*/
	$('[data-countdown]').each(function() {
		var $this = $(this), finalDate = $(this).data('countdown');
		$this.countdown(finalDate, function(event) {
			$this.html(event.strftime('<div class="single-countdown"><span class="single-countdown_time">%D</span><span class="single-countdown_text">Days</span></div><div class="single-countdown"><span class="single-countdown_time">%H</span><span class="single-countdown_text">Hours</span></div><div class="single-countdown"><span class="single-countdown_time">%M</span><span class="single-countdown_text">Min</span></div><div class="single-countdown"><span class="single-countdown_time">%S</span><span class="single-countdown_text">Sec</span></div>'));
		});
	});
	/*----------------------------------------*/
	/*------ Popup Image
	-------------------------------------------------*/
	$('.popup-gallery').magnificPopup({
		delegate: 'a',
		type: 'image',
		tLoading: 'Loading image #%curr%...',
		mainClass: 'mfp-img-mobile',
		gallery: {
			enabled: true,
			navigateByImgClick: true,
			preload: [0,1] // Will preload 0 - before current, and 1 after the current image
		},
		image: {
			tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
		}
	});
	/*---------------------------------
	/* 	MailChimp
    -----------------------------------*/
    $('#mc-form').ajaxChimp({
        language: 'en',
        callback: mailChimpResponse,
        // ADD YOUR MAILCHIMP URL BELOW HERE!
        url: 'http://devitems.us11.list-manage.com/subscribe/post?u=6bbb9b6f5827bd842d9640c82&amp;id=05d85f18ef'
    });
    function mailChimpResponse(resp) {
        if (resp.result === 'success') {
            $('.mailchimp-success').html('' + resp.msg).fadeIn(900);
            $('.mailchimp-error').fadeOut(400);
        } else if (resp.result === 'error') {
            $('.mailchimp-error').html('' + resp.msg).fadeIn(900);
        }
	}
	/*--------------------------
	 Ajax Contact Form JS
	---------------------------*/
	const form = $('#contact-form'),
	formMessages = $('.form-message');

	 $(form).submit(function (e) {
		 e.preventDefault();
		 var formData = form.serialize();
		 $.ajax({
			 type: 'POST',
			 url: form.attr('action'),
			 data: formData
		 }).done(function (response) {
			 // Make sure that the formMessages div has the 'success' class.
			 $(formMessages).removeClass('alert alert-danger');
			 $(formMessages).addClass('alert alert-success fade show');

			 // Set the message text.
			 formMessages.html("<button type='button' class='close' data-dismiss='alert'>&times;</button>");
			 formMessages.append(response);

			 // Clear the form.
			 $('#contact-form input,#contact-form textarea').val('');
		 }).fail(function (data) {
			 // Make sure that the formMessages div has the 'error' class.
			 $(formMessages).removeClass('alert alert-success');
			 $(formMessages).addClass('alert alert-danger fade show');

			 // Set the message text.
			 if (data.responseText !== '') {
				 formMessages.html("<button type='button' class='close' data-dismiss='alert'>&times;</button>");
				 formMessages.append(data.responseText);
			 } else {
				 $(formMessages).text('Oops! An error occurred and your message could not be sent.');
			 }
		 });
	 });
	/*--------------------------------
	/* 	Scroll To Top
	-------------------------------- */
	function scrollToTop() {
		var $scrollUp = $('.scroll-to-top'),
			$lastScrollTop = 0,
			$window = $(window);

		$window.on('scroll', function () {
			var topPos = $(this).scrollTop();
			if (topPos > $lastScrollTop) {
				$scrollUp.removeClass('show');
			} else {
				if ($window.scrollTop() > 200) {
					$scrollUp.addClass('show');
				} else {
					$scrollUp.removeClass('show');
				}
			}
			$lastScrollTop = topPos;
		});

		$scrollUp.on('click', function (evt) {
			$('html, body').animate({
				scrollTop: 0
			}, 600);
			evt.preventDefault();
		});
	}
	scrollToTop();
	/*----------------------------------------*/
	/*  Nice Select
	/*----------------------------------------*/
	$(document).ready(function () {
		$('.nice-select').niceSelect();
	});
	/*----------------------------------------*/
	/*-----  Preloader
	---------------------------------*/
	$(window).on('load', function () {
		$('#preloader').delay(350).fadeOut('slow')
		$('body').delay(350).css({'overflow':'visible'});
	});
    
	
})(jQuery);

