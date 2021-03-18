//. app.js
var express = require( 'express' ),
    client = require( 'cheerio-httpcli' ),
    app = express();

var settings = require( './settings' );

app.get( '/', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  res.write( JSON.stringify( { howtouse: 'access to /{searchkeyword for amazon.jp}' } ) );
  res.end();
});

app.get( '/:keyword', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var keyword = req.params.keyword;
  if( keyword ){
    var url = 'https://www.amazon.co.jp/s?k=' + encodeURI( keyword );
    client.fetch( url, {}, 'UTF-8', function( err, $, res0, body0 ){
      if( err ){
        res.status( 400 );
        res.write( JSON.stringify( { status: false, keyword: keyword, error: err } ) );
        res.end();
      }else{
        var items = [];
        $('div.s-main-slot div[data-component-type="s-search-result"]').each( function(){
          var asin = $(this).attr( 'data-asin' );
          var image_src = null;
          var link = null;
          var name = null;
          //var jancode = null;
          var star = -1;
          var denom = -1;
          var price = null;

          var target = $(this).find( 'div.a-spacing-medium' ).eq( 0 );
          if( target ){
            //. link, image_src
            var image_span = target.find( 'span[data-component-type="s-product-image"]' ).eq( 0 );
            if( image_span ){
              var image_a = image_span.find( 'a' ).eq( 0 );
              if( image_a ){
                link = image_a.attr( 'href' );

                if( link ){
                  link = link.split( '%2F' ).join( '/' );

                  var tmp = link.split( '&' );
                  tmp.forEach( function( t, idx ){
                    if( t.startsWith( 'url=' ) ){
                      link = t.substr( 4 );
                    }
                  });

                  tmp = link.split( '&' );
                  tmp.forEach( function( t, idx ){
                    if( t.startsWith( 'spLa=' ) ){
                      tmp.splice( idx, 1 );
                    }
                  });

                  if( settings && settings.aws_tag ){
                    tmp.push( 'tag=' + settings.aws_tag );
                  }
                  link = tmp.join( '&' );

                  link = 'https://www.amazon.co.jp' + link;
                }
              }

              var image = image_span.find( 'img' );
              if( image ){
                image_src = image.attr( 'src' );
              }
            }

            //. name
            var name_span = target.find( 'div.a-spacing-top-small h2 span' ).eq( 0 );
            if( name_span ){
              name = name_span.text();
            }

            //. price
            var price_span = target.find( 'div.a-spacing-top-small span.a-price span.a-offscreen' ).eq( 0 );
            if( price_span ){
              price_text = price_span.text();
              if( price_text.startsWith( '￥' ) ){
                price_text = price_text.substr( 1 );
              }
              price_text = price_text.split( ',' ).join( '' );
              if( price_text ){
                price = parseInt( price_text );
              }
            }
        
            //. star
            var star_i = target.find( 'div.a-spacing-top-micro i.a-icon-star-small' ).eq( 0 );
            if( star_i ){
              var star_class = star_i.attr( 'class' );
              if( star_class ){
                var star_tmp = star_class.split( ' ' );
                star_tmp.forEach( function( star_t ){
                  if( star_t.startsWith( 'a-star-small-' ) ){
                    var s = star_t.substr( 13 );
                    s = s.split( '-' ).join( '.' );
                    star = parseFloat( s );
                  }
                });
              }

              //. denom
              var row_div = star_i.parent().parent().parent().parent();
              if( row_div ){
                //var denom_span = row_div.find( 'span' ).eq( 1 );
                var denom_span = row_div.find( 'span.a-size-base' ).eq( 0 );
                if( denom_span ){
                  //var denom_tmp = denom_span.attr( 'aria-label' );
                  var denom_tmp = denom_span.text();
                  denom_tmp = denom_tmp.split( ',' ).join( '' );
                  if( denom_tmp ){
                    denom = parseInt( denom_tmp );
                  }
                }
              }
            }
        
        
            if( link && image_src && name ){
              var item = { asin: asin, name: name, link: link, image_src: image_src, price: price };
              if( star > -1 ){
                item.star = star;
              }
              if( denom > -1 ){
                item.denom = denom;
              }
              items.push( item );
            }
          }
        });

        res.write( JSON.stringify( { status: true, keyword: keyword, items: items } ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'no keyword spacified.' } ) );
    res.end();
  }
});


var port = process.env.PORT || 8080;
app.listen( port );
console.log( "server starting on " + port + " ..." );
