function Breakpoints( names ) {

	/**
	 * Store the window width as a local variable
	 *
	 * @type {Number}
	 */
	this.windowWidth = window.innerWidth;

	/**
	 * Store the passed breakpoint names locally
	 *
	 * @type {Array}
	 */
	this.keys = names || [ 'xs', 'sm', 'md', 'lg', 'xl' ];

	/**
	 * Empty object for storing breakpoint key/values
	 *
	 * @type {Object}
	 */
	this.gridBreakpoints = {};

	/**
	 * Load `gridBreakpoints` on init
	 */
	this.refresh();

	/**
	 * Allow the `gridBreakpoints` to be updated by triggering an event
	 */
	this.on( 'refresh', () => this.refresh() );

	/**
	 * This function runs on window `load` and `resize`. Mainly handles event firing
	 */
	const triggerListener = () => {
		this.windowWidth = window.innerWidth;

		for ( var key in this.gridBreakpoints ) {
			const value	= this.get( key );
			const min	= this.min( key );
			const max	= this.max( key );

			if ( this.isUp( key ) ) {
				this.trigger( `up.${key}`, value, min, max );
			}

			if ( this.isDown( key ) ) {
				this.trigger( `down.${key}`, value, min, max );
			}

			if ( this.isOnly( key ) ) {
				this.trigger( `only.${key}`, value, min, max );
			}
		}

		// We have to handle `between` listeners a little differently
		for ( let i = 0; i < this.listeners.length; i++ ) {
			const listener	= this.listeners[ i ];
			const matches	= listener.name.match( /^between\.(.{1,})-(.{1,})/i );

			const lower = matches && matches[ 1 ] ? matches[ 1 ] : false;
			const upper = matches && matches[ 2 ] ? matches[ 2 ] : false;

			if ( lower && upper ) {
				if ( this.isBetween( lower, upper ) ) {
					const min	= this.min( lower );
					const max	= this.max( upper );
					this.trigger( listener.name, min, max );
				}
			}
		}
	};

	/**
	 * Listen to window events
	 */
	window.addEventListener( 'load', triggerListener );
	window.addEventListener( 'resize', triggerListener );
}

/**
 * Hold all event listeners in a contained array
 *
 * @type	{Array}
 */
Breakpoints.prototype.listeners = [];

/**
 * Add event lister
 *
 * @param	{String}	event	Name of event to listen for
 * @param	{Function}	callback
 * @return	{Void}
 */
Breakpoints.prototype.on = function( event, callback ) {
	this.listeners.push( {
		name: event,
		callback: callback
	} );
};

/**
 * Trigger an event
 *
 * @param	{String}	event	Name of event to listen for
 * @param	{Mixed}		args	These args are passed to the callback function
 * @return	{Void}
 */
Breakpoints.prototype.trigger = function( event, ...args ) {
	for ( let i = 0; i < this.listeners.length; i++ ) {
		const listener = this.listeners[ i ];
		if ( listener.name === event ) {
			listener.callback( ...args );
		}
	}
};

/**
 * Refresh the grid breakpoints object
 *
 * @return	{Object}
 */
Breakpoints.prototype.refresh = function() {
	const styles = getComputedStyle( document.documentElement );

	let _return = {};
	for ( let i = 0; i < this.keys.length; i++ ) {
		const key = this.keys[ i ];
		_return[ key ] = parseInt( styles.getPropertyValue( `--breakpoint-${key}` ) );
	}

	this.gridBreakpoints = _return;

	return _return;
};

/**
 * Get breakpoint value by name
 *
 * @param	{String}	name
 * @return	{Number}
 */
Breakpoints.prototype.get = function( name ) {
	return this.gridBreakpoints[ name ];
};

/**
 * Get the next breakpoint in object
 *
 * @param	{String}	name
 * @return	{Object|null}
 */
Breakpoints.prototype.next = function( name ) {
	const keys	= this.keys;
	const index	= keys.indexOf( name );

	const nextKey	= keys[ index + 1 ];
	const nextValue	= this.gridBreakpoints[ nextKey ];
	const hasNext	= index !== -1 && nextKey && nextValue;

	return hasNext ? {
		key: nextKey,
		value: nextValue
	} : null;
};

/**
 * Get a breakpoints minimum width
 *
 * @param	{String}	name
 * @return	{Number}
 */
Breakpoints.prototype.min = function( name ) {
	const min = this.get( name );
	return min !== 0 ? min : null;
};

/**
 * Get a breakpoints maximum width
 *
 * @param	{String}	name
 * @return	{Number}
 */
Breakpoints.prototype.max = function( name ) {
	const next	= this.next( name );
	const max	= this.get( name );

	return next ? this.min( next.key ) - .02 : null;
};


/**
 * Check if the window width is wider than breakpoint
 *
 * @param	{String}	name
 * @return	{Boolean}
 */
Breakpoints.prototype.isUp = function( name ) {
	return this.windowWidth >= this.min( name );
};

/**
 * Check if the window width is smaller than breakpoint
 *
 * @param	{String}	name
 * @return	{Boolean}
 */
Breakpoints.prototype.isDown = function( name ) {
	return this.windowWidth < this.min( name );
};

/**
 * Check if the window width is wider than lower and less that upper
 *
 * @param	{String}	lower
 * @param	{String}	upper
 * @return	{Boolean}
 */
Breakpoints.prototype.isBetween = function( lower, upper ) {
	const min = this.min( lower );
	const max = this.max( upper );

	if ( min !== null && max !== null ) {
		return this.windowWidth > min && this.windowWidth < max;
	} else if ( max === null ) {
		return this.isUp( lower );
	} else if ( min === null )  {
		return this.isDown( upper );
	}

	return false;
};

/**
 * Check if the window width between the breakpoint's minimum and maximum widths
 *
 * @param	{String}	name
 * @return	{Boolean}
 */
Breakpoints.prototype.isOnly = function( name ) {
	return this.isBetween( name, name );
};

/**
 * Alias of `.on('up.${name}')`
 *
 * @param	{String}	name
 * @param	{Function}	callback
 */
Breakpoints.prototype.up = function( name, callback ) {
	this.on( `up.${name}`, callback );
};

/**
 * Alias of `.on('down.${name}')`
 *
 * @param	{String}	name
 * @param	{Function}	callback
 */
Breakpoints.prototype.down = function( name, callback ) {
	this.on( `down.${name}`, callback );
};

/**
 * Alias of `.on('between.${lower}-${upper}')`
 *
 * @param	{String}	lower
 * @param	{String}	upper
 * @param	{Function}	callback
 */
Breakpoints.prototype.between = function( lower, upper, callback ) {
	this.on( `between.${lower}-${upper}`, callback );
};

/**
 * Alias of `.on('only.${name}')`
 *
 * @param	{String}	name
 * @param	{Function}	callback
 */
Breakpoints.prototype.only = function( name, callback ) {
	this.on( `only.${name}`, callback );
};



