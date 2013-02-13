/* -----------------------------------------------------------------------------------------------------------------
 * Colorpicker
 * -----------------------------------------------------------------------------------------------------------------
 */

//Utility, create our own version of Object.create if the browser doesn't support it 
if(typeof Object.create !== 'function') {
    Object.create = function(obj) {
        function F() {};
        F.prototype = obj;
        return new F();
    };
}



(function($, window, document, undefined) {

    Colorpicker = {
        
        config: {
            rgb: true,
            hex: true,
            preview: true,
        },

        index: 0,

        colors: [
            {
                hex: 'FF0000',
                rgb: { 
                    0: 255,
                    1: 0,
                    2: 0,
                },
            },
            {
                hex: '00FF00',
                rgb: { 
                    0: 0,
                    1: 255,
                    2: 0,
                },
            },
            {
                hex: '0000FF',
                rgb: {
                    0: 0,
                    1: 0,
                    2: 255,
                }
            },
            {
                hex: 'FFFF00',
                rgb: {
                    0: 255,
                    1: 255,
                    2: 0,
                }
            },
            {
                hex: '00FFFF',
                rgb: {
                    0: 0,
                    1: 255,
                    2: 255,
                }
            },
            {
                hex: 'FF00FF',
                rgb: {
                    0: 255,
                    1: 0,
                    2: 255,
                }
            },
            {
                hex: 'FF8A00',
                rgb: {
                    0: 255,
                    1: 138,
                    2: 0,
                }
            },
            {
                hex: 'AAAAAA',
                rgb: {
                    0: 10,
                    1: 10,
                    2: 10,
                }
            },
            {
                hex: '000000',
                rgb: {
                    0: 0,
                    1: 0,
                    2: 0,
                }
            },
            {
                hex: 'FFFFFF',
                rgb: {
                    0: 255,
                    1: 255,
                    2: 255,
                }
            },
        ],

        init: function(config)
        {
            var self = this;

            this.config = $.extend({}, this.config, config);

            this.createColorpicker(this.config.colorpickerContainer);

            this.createColorBoxes(this.config.colorBoxes, this.config.colorBoxContainer);

            //Set the palette
            palette = document.getElementById('palette');
            context = palette.getContext('2d');
            var pointer = $('.palette-pointer');

            self.palette = {
                canvas: palette,
                context: context,
                width: palette.width,
                height: palette.height,
                pointer: pointer,
                pointerPos: {
                    x: 10,
                    y: 10,
                },
                color: {
                    rgb: {
                        0: 255,
                        0: 0,
                        0: 0,
                    },
                    hex: 'FF0000',
                }
            }

            //Set the hue
            hue = document.getElementById('hue');
            context = hue.getContext('2d');
            var pointer = $('.hue-pointer');

            self.hue = {
                canvas: hue,   
                context: context,
                width: hue.width,
                height: hue.height,
                pointer: pointer,
                pointerPos: {
                    x: 0,
                    y: 0,
                }
            }

            //Cache
            self.$hue = $('canvas#hue');
            self.$palette = $('canvas#palette');

            self.$huePointer = $('.hue-pointer');
            self.$palettePointer = $('.palette-pointer');

            self.$rgbContainer = $('.rgb-container');
            self.$hexContainer = $('.hex-container');
            self.$previewContainer = $('.preview-container');

            self.$rgbInput = $('.rgb-input');
            self.$hexInput = $('.hex-input');



            if(self.config.rgb !== true) { self.$rgbContainer.hide(); }
            if(self.config.hex !== true) { self.$hexContainer.hide(); }
            if(self.config.preview !== true) { self.$previewContainer.hide(); }



            self.drawHue();



            /* Events -------------------------------------------------------------------------- */

            /* -----------------------------------------------------------------
             * Click on the hue
             */
            self.$hue.on('click', function(e)
            {
                self.hue.pointerPos = self.getPointerPosition(self.hue, e);

                self.palette.color = self.convertColors(self.getRgb(self.hue));

                self.drawPalette();

                self.movePointer(self.hue);

                self.getPointerPositionByRgb(self.palette.color.rgb);
                self.movePointer(self.palette);

                //Change the colors and color codes of the elements                
                self.changeInputValues();
                self.changePreviewColor();
            });

            /* -----------------------------------------------------------------
             * Mousedown event on the hue that binds a mousemove event
             */
            self.$hue.on('mousedown', function()
            {
                self.$hue.bind('mousemove', function(e)
                {
                    self.hue.pointerPos = self.getPointerPosition(self.hue, e);

                    self.palette.color = self.convertColors(self.getRgb(self.hue));

                    self.drawPalette();

                    self.movePointer(self.hue);

                    self.getPointerPositionByRgb(self.palette.color.rgb);
                    self.movePointer(self.palette);

                    //Change the colors and color codes of the elements                    
                    self.changeInputValues();
                    self.changePreviewColor();
                });
            });

            /* -----------------------------------------------------------------
             * Mouseup on the hue
             */
            self.$hue.on('mouseup', function()
            {
                self.$hue.unbind('mousemove');
            });


            /* -----------------------------------------------------------------
             * Redirect a click event on the hue pointer to the hue
             */
            self.$huePointer.on('click', function(e)
            {
                self.$hue.trigger(e);
            });

            /* -----------------------------------------------------------------
             * Redirect a mousedown event on the hue pointer to the hue
             * and bind a mousemove event on the hue pointer that also redirects to the hue
             */
            self.$huePointer.on('mousedown', function(e)
            {
                self.$hue.trigger(e);

                self.$huePointer.bind('mousemove', function(e)
                {
                    self.$hue.trigger(e);
                });
            });

            /* -----------------------------------------------------------------
             * Redirect a mouseup event on the hue pointer to the hue
             * and unbind the mousemove event on the hue pointer
             */
            self.$huePointer.on('mouseup', function(e)
            {
                self.$huePointer.unbind('mousemove');

                self.$hue.trigger(e);
            });



            /* -----------------------------------------------------------------
             * Click on the palette
             */
            self.$palette.on('click', function(e)
            {
                self.palette.pointerPos = self.getPointerPosition(self.palette, e);

                self.palette.color = self.convertColors(self.getRgb(self.palette));

                self.movePointer(self.palette);

                //Change the colors and color codes of the elements
                self.changeInputValues();
                self.changePreviewColor();
            });

            /* -----------------------------------------------------------------
             * Mousedown event on the palette that binds a mousemove event
             */
            self.$palette.on('mousedown', function()
            {
                self.$palette.bind('mousemove', function(e)
                {
                    self.palette.pointerPos = self.getPointerPosition(self.palette, e);

                    self.palette.color = self.convertColors(self.getRgb(self.palette));

                    self.movePointer(self.palette);

                    //Change the colors and color codes of the elements
                    self.changeInputValues();
                    self.changePreviewColor();                    
                });

                $('.palette-pointer').bind('mousemove', function(e)
                {
                    self.$palette.trigger(e);
                });
            });

            /* -----------------------------------------------------------------
             * Mouseup event on the palette
             */
            self.$palette.on('mouseup', function()
            {
                self.$palette.unbind('mousemove');
            });


            /* -----------------------------------------------------------------
             * Redirect a click event on the palette pointer to the palette
             */
            self.$palettePointer.on('click', function(e)
            {
                self.$palette.trigger(e);
            });

            /* -----------------------------------------------------------------
             * Redirect a mousedown event on the palette pointer to the palette
             * and bind a mousemove event on the palette pointer that also redirects to the palette
             */
            self.$palettePointer.on('mousedown', function(e)
            {
                self.$palette.trigger(e);

                self.$palettePointer.bind('mousemove', function(e)
                {
                    self.$palette.trigger(e);
                });
            });

            /* -----------------------------------------------------------------
             * Redirect a mouseup event on the palette pointer to the palette
             * and unbind the mousemove event on the palette pointer
             */
            self.$palettePointer.on('mouseup', function(e)
            {
                self.$palettePointer.unbind('mousemove');

                self.$palette.trigger(e);
            });
            



            /* -----------------------------------------------------------------
             * Focus event on the RGB and HEX input fields
             */
            $('.rgb-input, .hex-input').on('focus', function()
            {
                this.select();
            });



            /* -----------------------------------------------------------------
             * Change event on the RGB input fields
             */
            self.$rgbInput.on('change', function()
            {
                var value = $(this).attr('value');

                //If the RGB value is incorrect, set it to zero
                if( !/^(\d+)$/i.test(value) || value > 255)
                {
                    $(this).attr('value', 0);                        
                }

                var rgb = {
                    0: $('.rgb-input:eq(0)').val(),
                    1: $('.rgb-input:eq(1)').val(),
                    2: $('.rgb-input:eq(2)').val(),
                };

                //Convert colors
                self.palette.color = self.convertColors(rgb);

                self.getPointerPositionByRgb(self.palette.color.rgb);


                
                //Is the position object empty? meaning the RGB is not found on the current palette background
                if($.isEmptyObject(self.palette.pointerPos))
                {
                    //Draw palette again with the RGB
                    self.drawPalette();

                    //Get position of that RGB on the palette and move the pointer to that RGB
                    self.getPointerPositionByRgb(self.palette.color.rgb);
                    self.movePointer(self.palette);
                }
                else
                {
                    //Move pointer to the RGB position
                    self.movePointer(self.palette);
                }

                //Change the colors and color codes of the elements
                self.changeInputValues();
                self.changePreviewColor();
            });



            /* -----------------------------------------------------------------
             * Change event on the HEX input field
             */
            self.$hexInput.on('change', function()
            {
                var value = $(this).attr('value');

                //If the HEX value is incorrect, set it to red
                if( ! /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test('#' + value))
                {
                    value = 'FF0000';

                    $(this).attr('value', value);
                }

                //Change colors
                self.palette.color = self.convertColors(value);

                self.drawPalette();

                //Get position of the RGB on the palette, and move the pointer to that RGB position
                self.getPointerPositionByRgb(self.palette.color.rgb);
                self.movePointer(self.palette);

                //Change the colors and color codes of the elements                
                self.changeInputValues();
                self.changePreviewColor();                
            });



            /* -----------------------------------------------------------------
             * Click event on save button, change the color for the current index
             */
            $('.colorpicker .save-button').on('click', function()
            {
                self.colors[self.index] = self.palette.color;

                $('.color-box-' + self.index).css('backgroundColor', '#' + self.palette.color.hex);

                self.config.colorpickerContainer.hide();
            });

            /* -----------------------------------------------------------------
             * Click event on cancel button, change the palette color back to the current index
             */
            $('.colorpicker .cancel-button').on('click', function()
            {
                self.palette.color = self.colors[self.index];

                self.config.colorpickerContainer.hide();
            });


            /* -----------------------------------------------------------------
             * Click event on the color boxes, gets the index for the color to open in
             * the Colorpicker
             */
            $('.color-box').on('click', function()
            {
                var index = $(this).data('color-index');

                self.open(index);
            });
        },


        /* ----------------------------------------------------------------------------------------------
         * Open up the colorpicker with the color for the passed index (self.colors[index])
         *
         * @param  int  index  The index for the color in the colors array, that can be changed in the colorpicker 
         */
        open: function(index)
        {
            var self = this;

            //Set current color
            self.index = index;

            //Set the palette color
            self.palette.color = self.colors[index];

            self.drawPalette();

            self.getPointerPositionByRgb(self.palette.color.rgb);
            self.movePointer(self.palette);

            self.movePointer(self.hue);

            self.changeInputValues();
            self.changePreviewColor();            
            $('.current-color').css('backgroundColor', '#' + self.colors[self.index].hex);

            self.config.colorpickerContainer.show();
        },


        /* ----------------------------------------------------------------------------------------------
         * Create ´color boxes´ that hold the index for a box it´s color, 
         */
        createColorBoxes: function(amount, container)
        {
            var self     = this,
                elements = '';

            for(var i=0; i<amount; i++)
            {
                if(self.colors[i] != undefined)
                {
                    elements += '<div class="color-box color-box-' + i + '" data-color-index="' + i + '" style="background-color: #' + self.colors[i].hex + '"></div>';
                }
            }

            container.append(elements);
        },



        /* ----------------------------------------------------------------------------------------------
         * Create the elements for the Colorpicker
         */
        createColorpicker: function(container)
        {
            var self = this;

            self.$colorpicker  = $('<div class="colorpicker"></div>');

                //Palette
            var elements  = '<div class="palette-container">';
                elements += '<canvas id="palette" width="200" height="200"></canvas>';
                elements += '<div class="palette-pointer"></div>';
                elements += '</div>';

                //Hue
                elements += '<div class="hue-container">';
                elements += '<canvas id="hue" width="20" height="200"></canvas>';
                elements += '<div class="hue-pointer"></div>';
                elements += '</div>';

                //RGB inputs
                elements += '<div class="rgb-container">';
                elements += '<label>R</label><input class="rgb-input" data-rgb="r" type="text" maxlength="3" />';
                elements += '<label>G</label><input class="rgb-input" data-rgb="g" type="text" maxlength="3" />';
                elements += '<label>B</label><input class="rgb-input" data-rgb="b" type="text" maxlength="3" />';
                elements += '</div>';

                //HEX input
                elements += '<div class="hex-container">';
                elements += '<label>#</label><input class="hex-input" type="text" maxlength="6" />';
                elements += '</div>';

                //Buttons
                elements += '<div class="buttons">';
                elements += '<button class="cancel-button">cancel</button>';
                elements += '<button class="save-button">save</button>';
                elements += '</div>';

                //Preview
                elements += '<div class="preview-container">';
                elements += '<div class="preview-color"></div>';
                elements += '<div class="current-color"></div>';
                elements += '</div>';

            self.$colorpicker.append(elements);

            container.append(self.$colorpicker);
        },



        /* ----------------------------------------------------------------------------------------------
         * Draw the bgGradient.png image and the current HEX color on the palette
         */
        drawPalette: function()
        {
            var self = this;

            self.palette.context.clearRect(0, 0, 200, 200);            

            //Add the current color
            self.palette.context.fillStyle = '#' + self.palette.color.hex;
            self.palette.context.fillRect(0, 0, 200, 200);

            //Draw the Gradient background image
            var image = new Image();
                
            image.src = 'images/gradient.png';

            self.palette.context.drawImage(image, 0, 0);
        },



        /* ----------------------------------------------------------------------------------------------
         * Draw a gradient of red/yellow/green/blue/purple/red on the hue
         */
        drawHue: function()
        {
            var self = this;

            self.hue.context.clearRect(0, 0, 20, 200);

            //Create the hue gradient
            var lingrad = self.hue.context.createLinearGradient(0, 0, 0, 200);
                lingrad.addColorStop(0,    '#FF0000');
                lingrad.addColorStop(0.17, '#FFFF00');
                lingrad.addColorStop(0.33, '#00FF00');
                lingrad.addColorStop(0.50, '#00FFFF');
                lingrad.addColorStop(0.67, '#0000FF');
                lingrad.addColorStop(0.83, '#FF00FF');
                lingrad.addColorStop(1,    '#FF0000');

            self.hue.context.fillStyle = lingrad;
            self.hue.context.fillRect(0, 0, 20, 200);
        },



        /* ----------------------------------------------------------------------------------------------
         * Change the RGB and HEX input values to the current color on the palette
         */
        changeInputValues: function()
        {
            var self = this;

            self.$rgbInput.each(function(index)
            {
                $(this).attr('value', self.palette.color.rgb[index]);
            });

            self.$hexInput.attr('value', self.palette.color.hex);
        },



        /* ----------------------------------------------------------------------------------------------
         * Change the preview color to the current color on the palette
         */
        changePreviewColor: function()
        {
            var self = this;

            $('.preview-color').css('backgroundColor', '#' + self.palette.color.hex);
        },



        /* ----------------------------------------------------------------------------------------------
         * Get the RGB value from the current cursor position on the palette or hue
         */
        getRgb: function(obj)
        {
            var self = this;

            //Get the RGB values
            var rgb = obj.context.getImageData(obj.pointerPos.x, obj.pointerPos.y, 1, 1).data;

            
            return rgb;
        },



        /* ----------------------------------------------------------------------------------------------
         * Get the current position of the cursor on the palette or hue
         */
        getPointerPosition: function(obj, e)
        {
            var self = this,
                rect = obj.canvas.getBoundingClientRect();

            var x = e.clientX - rect.left,
                y = e.clientY - rect.top;

            //Limit position of the pointer
            if(x < 1)   { x = 1; }
            if(x > 200) { x = 200; }

            if(y < 1)   { y = 1; }
            if(y > 200) { y = 200; }

            return {
                x: x,
                y: y,
            };
        },



        /* ----------------------------------------------------------------------------------------------
         * Get the current position of the cursor on the palette or hue by a RGB value
         */
        getPointerPositionByRgb: function(rgb)
        {
            var self = this;

            console.log('move');

            //Get the RGB for every pixel
            var data = self.palette.context.getImageData(0, 0, self.palette.width, self.palette.height).data;

            var coords = {

            };

            i = 0;

            //Loop through all the pixels
            yloop:
            for(var y=0; y<self.palette.height; y++)
            {
                xloop:
                for(var x=0; x<self.palette.width; x++)
                {
                    if(data[i] == rgb[0] && data[i+1] == rgb[1] && data[i+2] == rgb[2])
                    {
                        coords = {
                            x: x,
                            y: y,
                        }

                        break yloop;
                    }

                    i += 4;
                }
            }

            self.palette.pointerPos = coords;
        },



        /* ----------------------------------------------------------------------------------------------
         * Convert RGB to HEX or HEX to RGB
         */
        convertColors: function(value)
        {
            var self = this;

            //If value is an RGB color value
            if(typeof value == 'object')
            {
                //Convert RGB to HEX
                hex = '';

                //Loop over the three RGB values
                for(i=0; i<3; i++)
                {
                    //Convert to HEX
                    num = parseInt(value[i]).toString(16);

                    //Prepend a zero if needed
                    if(num.length == 1) { num = '0' + num; }

                    //Append the HEX
                    hex += num;
                }

                return {
                    rgb: {
                        0: value[0],
                        1: value[1],
                        2: value[2],
                    },
                    hex: hex,
                }
            }
            else
            {
                //Convert HEX to RGB

                if(value.length == 3)
                {
                    //Split at every character
                    var hex = value.split('');                
                }
                else if(value.length == 6)
                {
                    //Split the HEX value at every second character
                    var hex = value.match(/[\s\S]{1,2}/g);
                }                

                rgb = [];

                //Loop over the HEX values
                for(i=0; i<hex.length; i++)
                {
                    //Convert to a RGB value
                    num = parseInt(hex[i], 16);

                    //Add the RGB value to the array
                    rgb.push(num);
                }

                return {
                    rgb: rgb,
                    hex: value,
                }
            }
        },



        /* ----------------------------------------------------------------------------------------------
         * Move the pointer
         */
        movePointer: function(obj)
        {
            var self = this;

            obj.pointer.css({
                left: obj.pointerPos.x - 6,
                top: obj.pointerPos.y - 6,
            });
        },
    };    


})(jQuery, window, document);