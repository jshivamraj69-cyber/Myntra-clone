document.addEventListener('DOMContentLoaded', () => {
	const productCards = [...document.querySelectorAll('.product-card')];
	const addToCartButtons = document.querySelectorAll('.add-to-cart');
	const detailsButtons = document.querySelectorAll('.details-button');
	const searchInput = document.querySelector('#searchInput');
	const categoryLinks = document.querySelectorAll('nav a[data-category]');
	const cartButton = document.querySelector('#cartButton');
	const cartMessage = document.querySelector('#cartMessage');
	const cartItemsElement = document.querySelector('#cartItems');
	const cartTotalElement = document.querySelector('#cartTotal');
	const clearCartButton = document.querySelector('#clearCartButton');

	let cartItems = JSON.parse(localStorage.getItem('myntraCartItems') || '[]');

	const modal = document.createElement('div');
	modal.className = 'product-modal';
	modal.hidden = true;
	modal.innerHTML = `
		<div class="modal-backdrop" data-close-modal></div>
		<div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
			<button class="modal-close" type="button" aria-label="Close product details" data-close-modal>&times;</button>
			<div class="modal-product"></div>
		</div>
	`;
	document.body.appendChild(modal);
	const modalProduct = modal.querySelector('.modal-product');

	const getProductDetails = card => ({
		name: card.querySelector('h3').textContent,
		image: card.querySelector('img').src,
		alt: card.querySelector('img').alt,
		price: Number(card.querySelector('.price').dataset.price),
		priceText: card.querySelector('.price strong').textContent,
		originalPrice: card.querySelector('.price del').textContent,
		discount: card.querySelector('.price em').textContent,
		rating: card.querySelector('.rating').textContent,
		offer: card.querySelector('.offer').textContent,
		category: card.dataset.category
	});

	const openProductDetails = card => {
		const product = getProductDetails(card);
		modalProduct.innerHTML = `
			<img src="${product.image}" alt="${product.alt}">
			<div class="modal-product-info">
				<span class="modal-category">${product.category}</span>
				<h2 id="modalTitle">${product.name}</h2>
				<p class="modal-rating">${product.rating}</p>
				<p class="modal-price"><strong>${product.priceText}</strong> <del>${product.originalPrice}</del> <em>${product.discount}</em></p>
				<p class="modal-description">A versatile ${product.name.toLowerCase()} designed for everyday comfort, easy styling, and dependable quality.</p>
				<p class="modal-offer">${product.offer}</p>
				<button class="modal-add-button" type="button">Add to Bag</button>
			</div>
		`;
		modal.hidden = false;
		document.body.classList.add('modal-open');
		modalProduct.querySelector('.modal-add-button').addEventListener('click', () => {
			cartItems.push({ name: product.name, price: product.price });
			renderCart();
			cartMessage.textContent = `${product.name} added to your bag.`;
			closeModal();
		});
	};

	const closeModal = () => {
		modal.hidden = true;
		document.body.classList.remove('modal-open');
	};

	const renderCart = () => {
		const cartCount = cartItems.length;
		cartButton.textContent = `Bag (${cartCount})`;
		cartItemsElement.innerHTML = '';

		if (!cartItems.length) {
			cartItemsElement.innerHTML = '<p class="empty-cart">Your bag is empty.</p>';
		} else {
			cartItems.forEach((item, index) => {
				const cartItem = document.createElement('li');
				cartItem.className = 'cart-item';
				cartItem.innerHTML = `
					<span>${item.name} - ₹${item.price}</span>
					<button type="button" data-remove-index="${index}">Remove</button>
				`;
				cartItemsElement.appendChild(cartItem);
			});
		}

		const total = cartItems.reduce((sum, item) => sum + item.price, 0);
		cartTotalElement.textContent = `Total: ₹${total}`;
		localStorage.setItem('myntraCartItems', JSON.stringify(cartItems));
	};

	const showProducts = (searchTerm = '', category = 'all') => {
		const normalizedSearch = searchTerm.trim().toLowerCase();

		productCards.forEach(card => {
			const productName = card.querySelector('h3').textContent.toLowerCase();
			const matchesSearch = productName.includes(normalizedSearch);
			const matchesCategory = category === 'all' || card.dataset.category === category;
			card.hidden = !(matchesSearch && matchesCategory);
		});
	};

	addToCartButtons.forEach(button => {
		button.addEventListener('click', () => {
			const card = button.closest('.product-card');
			const name = card.querySelector('h3').textContent;
			const price = Number(card.querySelector('.price').dataset.price);
			cartItems.push({ name, price });
			renderCart();
			cartMessage.textContent = `${name} added to your bag.`;
		});
	});

	detailsButtons.forEach(button => {
		button.addEventListener('click', () => {
			openProductDetails(button.closest('.product-card'));
		});
	});

	modal.addEventListener('click', event => {
		if (event.target.closest('[data-close-modal]')) closeModal();
	});

	document.addEventListener('keydown', event => {
		if (event.key === 'Escape' && !modal.hidden) closeModal();
	});

	searchInput.addEventListener('input', event => {
		showProducts(event.target.value);
	});

	categoryLinks.forEach(link => {
		link.addEventListener('click', event => {
			event.preventDefault();
			categoryLinks.forEach(item => item.classList.remove('active'));
			link.classList.add('active');
			showProducts(searchInput.value, link.dataset.category);
		});
	});

	cartButton.addEventListener('click', () => {
		document.querySelector('#cartSection').scrollIntoView({ behavior: 'smooth' });
	});

	cartItemsElement.addEventListener('click', event => {
		const removeButton = event.target.closest('[data-remove-index]');
		if (!removeButton) return;
		cartItems.splice(Number(removeButton.dataset.removeIndex), 1);
		renderCart();
	});

	clearCartButton.addEventListener('click', () => {
		cartItems = [];
		renderCart();
		cartMessage.textContent = 'Your bag has been cleared.';
	});

	renderCart();
});
