!function(e,m){var k=function(b,f){e.fn.sourceFallback?b.sourceFallback():10<f||window.setTimeout(function(){k(b,f+1)},100)};e(m).ready(function(){var b=e("#vod-section-wrap");if(b.length){var f=b.find("._vod-content-list");b.on("click","._tab-nav",function(a){var d=e(a.currentTarget).data("list");a=null;d?(a=f.filter(d),d=f.not(a)):d=f;if(a.length)for(var b=a.find("img._lazy-load"),g=0,n=b.length;g<n;g++){var c=b.eq(g);c.removeClass("_lazy-load");e.fn.sourceFallback?k(c):c.prop("src",c.data("src"))}d.length&&
d.css("display","none");a.length&&(a.css("display",""),a.slider())})}b=e("#daily-recommend-wrap");if(b.length){var h=b.find("._recommend-list");b.on("click","._tab-nav",function(a){var d=e(a.currentTarget).data("list");a=null;d?(a=h.filter(d),d=h.not(a)):d=h;if(a.length)for(var b=a.find("img._lazy-load"),g=0,f=b.length;g<f;g++){var c=b.eq(g);c.removeClass("_lazy-load");e.fn.sourceFallback?k(c):c.prop("src",c.data("src"))}d.length&&d.css("display","none");a.length&&a.css("display","")})}b=e("#program-list-wrap");
if(b.length){var l=b.find("._program-list");b.on("click","._tab-nav",function(a){var b=e(a.currentTarget).data("list");a=null;b?(a=l.filter(b),b=l.not(a)):b=l;if(a.length)for(var f=a.find("img._lazy-load"),g=0,h=f.length;g<h;g++){var c=f.eq(g);c.removeClass("_lazy-load");e.fn.sourceFallback?k(c):c.prop("src",c.data("src"))}b.length&&b.css("display","none");a.length&&(a.css("display",""),a.slider())})}})}(jQuery,document);