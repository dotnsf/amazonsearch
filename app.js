//. app.js
var express = require( 'express' ),
    client = require( 'cheerio-httpcli' ),
    app = express();

var settings = require( './settings' );

app.use( express.Router() );
app.use( express.static( __dirname + '/public' ) );

client.set( 'browser', 'chrome' );
client.set( 'headers', { 
  'Referer': 'https://www.amazon.co.jp'
});

//. CORS
if( settings && settings.cors && settings.cors.length && settings.cors[0] ){
  var cors = require( 'cors' );
  var option = {
    origin: function( origin, callback ){
      if( settings.cors.indexOf( origin ) > -1 ){
        callback( null, true );
      }else{
        callback( new Error( 'Not allowed by CORS' ) );
      }
    },
    optionSuccessStatus: 200
  };
  app.use( cors( option ) );
}

//. Search Indexes
var search_indexes = [];
client.fetch( 'https://www.amazon.co.jp/', {}, 'UTF-8', function( err, $, res0, body0 ){
  if( err ){
    console.log( err );
  }else{
    $('#searchDropdownBox option').each( function(){
      var name = $(this).text().trim();
      var o = $(this).attr( 'value' ).split( '=' );
      if( o && o.length == 2 && o[0] == 'search-alias' ){
        if( o[1] == 'aps' ){  //. すべてのカテゴリー
          o[1] = '';
        }
        search_indexes.push( { name: name, index: o[1] } );
      }
    });
    //console.log( search_indexes );
  }
});


async function getJancode( url ){
  return new Promise( async ( resolve, reject ) => {
    client.fetch( url, {}, 'UTF-8', function( err, $, res0, body0 ){
      if( err ){
        console.log( err );
        resolve( null );
      }else{
        var jancode = '';
        $('#detailBullets_feature_div ul li').each( function(){
          var item_spans = $(this).find( 'span' );
          if( item_spans.length == 3 ){
            var item_span1 = item_spans.eq( 1 );
            //console.log( item_span1.text() );
            if( item_span1.text() == '製造元リファレンス' ){
              jancode = item_spans.eq( 2 ).text();
            }
          }
        });

        resolve( jancode );
      }
    });
  });
}

app.get( '/ping', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  res.write( JSON.stringify( { status: true, message: 'PONG' } ) );
  res.end();
});

app.get( '/searchindexes', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  res.write( JSON.stringify( { status: true, searchindexes: search_indexes } ) );
  res.end();
});

app.get( '/:keyword', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var keyword = req.params.keyword;
  if( keyword ){
    var url = 'https://www.amazon.co.jp/s?k=' + encodeURI( keyword );

    var sort = req.query.sort;
    if( sort ){
      switch( sort ){
      case 'byprice':
        url += '&s=price-asc-rank';
        break;
      case 'bypricedesc':
        url += '&s=price-desc-rank';
        break;
      case 'byreview':
        url += '&s=review-rank';
        break;
      case 'bydate':
        url += '&s=date-desc-rank';
        break;
      default:
        url += '&s=' + sort;
        break;
      }
    }

    client.fetch( url, {}, 'UTF-8', function( err, $, res0, body0 ){
      if( err ){
        console.log( err );
        res.status( 400 );
        res.write( JSON.stringify( { status: false, keyword: keyword, error: err } ) );
        res.end();
      }else{
        var items = [];
        $('div.s-main-slot div[data-component-type="s-search-result"]').each( async function(){
          var asin = $(this).attr( 'data-asin' );
          var image_src = null;
          var link = 'https://www.amazon.co.jp/dp/' + asin;
          var name = null;
          var jancode = null;
          var star = -1;
          var denom = -1;
          var price = null;

          //var target = $(this).find( 'div.a-spacing-medium' ).eq( 0 );
          var target = $(this).find( 'div.a-spacing-base' ).eq( 0 );
          if( target ){
            //. link, image_src
            var image_span = $(target).find( 'span[data-component-type="s-product-image"]' ).eq( 0 );
            if( image_span ){
              //. LINK
              if( settings && settings.aws_tag ){
                link += '?tag=' + settings.aws_tag + '&linkCode=osi&th=1&psc=1';
              }

              //. IMAGE_SRC
              var image = image_span.find( 'img' );
              if( image ){
                image_src = image.attr( 'src' );
              }
            }

            //. NAME
            var name_span = target.find( 'div.a-spacing-top-small h2 span' ).eq( 0 );
            if( name_span ){
              name = name_span.text();
            }

            //. PRICE
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
        
            //. STAR
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

              //. DENOM（評価母数）
              var row_div = star_i.parent().parent().parent().parent();
              if( row_div ){
                var denom_span = row_div.find( 'span.a-size-base' ).eq( 0 );
                if( denom_span ){
                  var denom_tmp = denom_span.text();
                  denom_tmp = denom_tmp.split( ',' ).join( '' );
                  if( denom_tmp ){
                    denom = parseInt( denom_tmp );
                  }
                }
              }
            }

            //. JAN コード
            if( asin ){
              var jandiv = $('div[data-asin="' + asin + '"] a.a-link-normal').eq( 0 );
              if( jandiv ){
                var janhref = jandiv.attr( 'href' );
                var tmp = janhref.split( '-' );
                if( tmp.length > 2 ){
                  var code = tmp[1];
                  var b = true;
                  for( var i = 0; i < code.length && b; i ++ ){
                    var c = code.substr( i, 1 );
                    b = ( '0' <= c && c <= '9' );
                  }
                  if( b ){
                    jancode = code;
                  }
                }
              }
            }
        
            if( link && image_src && name ){
              //. 一覧からはJANコードが見つからなかった場合に、更に調べるか？
              if( link && !jancode && settings.jancodelink ){
                jancode = await getJancode( link );
              }

              var item = { asin: asin, name: name, link: link, image_src: image_src, price: price, jancode: jancode };
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
