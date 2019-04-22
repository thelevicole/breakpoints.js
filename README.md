# Javascript breakpoints for Bootstrap

## Basic usage

```javascript
var bp = new Breakpoints();

bp.up( 'md', function() {
	console.log( 'This will run if the screen size is wider than 768px' );
} );

bp.down( 'sm', function() {
	console.log( 'This will run if the screen size is smaller than 576px' );
} );

var button = document.querySelector( 'button' );

button.onclick = function() {
	if ( bp.isUp( 'lg' ) ) {
		alert( 'Screen is large and up' );
	} else {
		alert( 'Screen is smaller than large' );
	}
};

window.onresize = function() {
	if ( window.innerWidth < bp.get( 'md' ) ) {
		// Custom resize handling
	}
};
```

## Custom breakpoints

If you have customised the Bootstrap grid and have non standard breakpoints ([see here](https://getbootstrap.com/docs/4.3/layout/grid/#grid-tiers)), you can defined these like so:

```javascript
var bp = new Breakpoints( [ 'small', 'medum', 'large' ] );

bp.up( 'medum', function() {
	...
} );

bp.down( 'large', function() {
	...
} );
```