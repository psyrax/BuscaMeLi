;(function ($, window, undefined) {
  'use strict';

  var $doc = $(document),
      Modernizr = window.Modernizr;

  $(document).ready(function() {
    $.fn.foundationAlerts           ? $doc.foundationAlerts() : null;
    $.fn.foundationButtons          ? $doc.foundationButtons() : null;
    $.fn.foundationAccordion        ? $doc.foundationAccordion() : null;
    $.fn.foundationNavigation       ? $doc.foundationNavigation() : null;
    $.fn.foundationTopBar           ? $doc.foundationTopBar() : null;
    $.fn.foundationCustomForms      ? $doc.foundationCustomForms() : null;
    $.fn.foundationMediaQueryViewer ? $doc.foundationMediaQueryViewer() : null;
    $.fn.foundationTabs             ? $doc.foundationTabs({callback : $.foundation.customForms.appendCustomMarkup}) : null;
    $.fn.foundationTooltips         ? $doc.foundationTooltips() : null;
    $.fn.foundationMagellan         ? $doc.foundationMagellan() : null;
    $.fn.foundationClearing         ? $doc.foundationClearing() : null;

    $.fn.placeholder                ? $('input, textarea').placeholder() : null;
  });

  // UNCOMMENT THE LINE YOU WANT BELOW IF YOU WANT IE8 SUPPORT AND ARE USING .block-grids
  // $('.block-grid.two-up>li:nth-child(2n+1)').css({clear: 'both'});
  // $('.block-grid.three-up>li:nth-child(3n+1)').css({clear: 'both'});
  // $('.block-grid.four-up>li:nth-child(4n+1)').css({clear: 'both'});
  // $('.block-grid.five-up>li:nth-child(5n+1)').css({clear: 'both'});

  // Hide address bar on mobile devices (except if #hash present, so we don't mess up deep linking).
  if (Modernizr.touch && !window.location.hash) {
    $(window).load(function () {
      setTimeout(function () {
        window.scrollTo(0, 1);
      }, 0);
    });
  }

})(jQuery, this);


MELI.init({client_id: XXXXXXX});
$(document).ready(function(){
  //resultados ML
  if(typeof getUrlVars()['q']!='undefined'){
    $('.ui').fadeIn();
    var mArr = getUrlVars();
    var arrayed = $.makeArray(mArr);
    var qParams = [];
    qParams.length=0;
    $.map(arrayed[0], function(val, i){
      var paramQ = i + '=' + val;
      qParams.push(paramQ);
    });
    var jParams = qParams.join('&');
    query =  jParams;
    listado();
  }else{
    $('.no_query').fadeIn();
  }
  
  $('.listed').live('click', function(){
    $('.listed').removeClass('callout');
    $(this).addClass('callout');
    ga_events($(this).data('item_id'), 'Listado');
    vistado($(this).data('item_id'));
    $("#detalle").show();
  });
  $('.anterior, .siguiente').on('click', function(){
    var destino = $(this).data('dest');
    vistado(destino);
    $('.listed').removeClass('callout');
    $('#'+ destino).addClass('callout');
  });
  $('.thumbnail').live('click', function(){
    $('.imagen').attr('src', $(this).data('img'));
  })
});

function listado(offset){
  if (typeof offset=="undefined") {offset=0}
    else{offset = offset};
  var offseturl = "&offset=" + offset * 50;
  ga_events(query, 'Query');
  MELI.get(
    "/sites/MLM/search?"+ query + offseturl,{},
      function(data) {
        var busqueda = data[2].query;
        var filtrosActivos = data[2].filters;
        var resultados = data[2].results;
        var filtros = data[2].available_filters;
        $.each(filtros, function(index, value){
          var mlid = value.id;
          $('.filtros').append('<div class="four columns"><h6 class="subheader">' + value.name + '</h6><ul class="square" id="ML_' + mlid + '"></ul></div>');
          $.each(value.values, function(index, value){
            var filtro_make =  query + '&' + mlid + '=' + value.id;
            $('#ML_' + mlid).append('<li><a href="?' + filtro_make + '">' + value.name + '</a> ['+ value.results +']</li>');
          })
        });
        $('.cat_loader').fadeOut();
        $('.ender').show();
        $('#sbox').val(busqueda);
        $.each(filtrosActivos, function(index, value){
          $('.filtrosActivos').append('<li><span>' + value.name + ': ' + value.values[0].name + '</span></li>');
        });
        if(filtrosActivos.length>0){
          $('.filtrosActivos').show();
        };
        $.each(resultados, function(index, value){
          if(value.subtitle!=null){
            _subtitle=value.subtitle;
          }
          else{
            _subtitle="";
          }
          if(value.condition=="used"){
            var condicion="Usado";
          }else{
            var condicion="Nuevo";
          }
          $('.scrolling').height($(window).height()-$('#principal').offset().top);
          $('.resultados').append('<li class="panel listed" data-item_id="'+value.id+'" id="' + value.id + '">' + 
                        '<p class="pre_title">' + value.title + '</p>' +
                        '<div class="row">' +
                          '<div class="four columns">' + 
                          '<img src="' + value.thumbnail +'" >' + 
                          '</div>' + 
                          '<div class="eight columns list_details">' +
                            '<ul class="square pre_text">' +
                              '<li>$' + value.price + '</li>' + 
                              '<li>' + value.address.state_name + '</li>' +
                              '<li>' + condicion + '</li>' +
                            '</ul>' +
                          '</div>' +
                        '</div>' +
                      '</li>');
        });
        var nextOff = offset+1;
        var nextText = nextOff+1;
        if(nextOff*50>data[2].paging.total){
          $('.resultados').append('<li><h1 class="subheader">Fin <i class="foundicon-error"></i></h1></li>');
        }else{
          $('.resultados').append('<li class="ender" onClick="listado(' + nextOff + ')"><h1 class="subheader"><small>Ver P&aacute;gina ' + nextText + '</small></h1></li>');
        }
        
      });
}
function vistado(nani){
  var next = $('#' + nani).next().data('item_id');
  var prev = $('#' + nani).prev().data('item_id');
  navegador(next, prev);
  MELI.get(
    "/items/"+ nani,{},function(data){
      vistador=data[2];
      var titulo=vistador.title;
      var precio=vistador.price;
      if(vistador.condition=="used"){
        var condicion="Usado";
      }else{
        var condicion="Nuevo";
      }
      var cantidad=vistador.initial_quantity;
      var vendidos=vistador.sold_quantity;
      var ubicacion=vistador.seller_address.city.name + ', ' + vistador.seller_address.state.name;
      var permalink=vistador.permalink;
      var formas_pago=[];
      if(vistador.accepts_mercadopago==true){
        formas_pago.push("Mercado Pago");
      };
      $.each(vistador.non_mercado_pago_payment_methods, function(index, value){
        var fpago=value.description;
        formas_pago.push(fpago);
      });
      var pagos=formas_pago.join(", ");
      sellerInfo(vistador.seller_id);
      $('.pricing_item').empty();
      $('.pricing_item').append('<ul class="pricing-table">'+ 
                                  '<li class="title">' + titulo + '</li>' +
                                  '<li class="price">$' + precio + '</li>' +
                                  '<li class="bullet-item datos">Condici&oacute;n: ' + condicion + '</li>' +
                                  '<li class="bullet-item datos">Vendidos: ' + vendidos + ' de ' + cantidad + '</li>' +
                                  '<li class="bullet-item datos">Ubicaci&oacute;n: ' + htmlEntities(ubicacion) + '</li>' +
                                  '<li class="bullet-item datos">Formas de pago: ' + formas_pago + '</li>' +
                                  '<li class="bullet-item datos vendedor">Vendedor: </li>' +
                                  '<li class="cta-button"><a href="' +permalink + '" class="button radius">Ver en ML</a></li>' +
                                '</ul>');
      $('.imagenes').empty();
      $('.imagenes').append('<ul class="block-grid three-up imagenes_mini" data-clearing></ul>');
      $.each(vistador.pictures, function(index, value){
        $('.imagenes_mini').append('<li><a href="' + value.url + '"><img src="' + value.url + '" /></a></li>');
      });
      var $doc = $(document);
      $.fn.foundationClearing         ? $doc.foundationClearing() : null;
      descriptionItem(vistador.id);
    });
}
function sellerInfo(sID){
  MELI.get(
    "/users/"+ sID,null,function(data){
      $('.vendedor').append('<a href="' + data[2].permalink + '">' + data[2].nickname + '</a>, ' + data[2].seller_reputation.level_id);
    });
}
function descriptionItem(aID){
  MELI.get(
    "/items/" + aID + "/descriptions",{},function(data){
      $('.cat_row').fadeOut();
      $('.desc').html(data[2][0].text);
      $('.desc').children().attr({'style':'','width':'','height':''});
    });
}
function getUrlVars(){
    var vars = {}, hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        //vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function navegador(next, prev){
  if(typeof prev=="undefined"){
    $('.anterior').hide();
  }else{
    $('.anterior').show();
  }
  $('.anterior').data('dest', prev);
  $('.siguiente').data('dest', next);
}