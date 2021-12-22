from PIL import Image, ImageDraw, ImageFont
import json
import io
import os
import sys

tile_loc = 'hs-card-tiles-master/Tiles/'
tile_dest = '../src/resources/Tiles/'
cards_json = '../src/resources/cards.compact.json'
hero_dest = 'Heros'
resources_dir = 'resources/'
english_font = resources_dir + 'Belwe-Bold.ttf'
asia_font = resources_dir + 'NotoSansCJK-Bold.ttc'
chinese_font = resources_dir + 'fangzhenglibian.ttf'
name_font = resources_dir + 'NotoSansCJK-Bold.ttc'
star = resources_dir + 'star.png'

tile_container_open = resources_dir + 'tile_container_open.png'
tile_container_number = resources_dir + 'tile_container_number.png'

card_dict = {}
with open(cards_json, encoding="utf-8") as json_file:
    data = json.load(json_file)
    for card in data:
        card_dict[card['id']] = card

def interpolate_color(minval, maxval, val, color_palette):
    """ Computes intermediate RGB color of a value in the range of minval-maxval
        based on color_palette representing the range. """
    #stack overflow is bae
    max_index = len(color_palette)-1
    v = float(val-minval) / float(maxval-minval) * max_index
    i1, i2 = int(v), min(int(v)+1, max_index)
    (r1, g1, b1, a1), (r2, g2, b2, a2) = color_palette[i1], color_palette[i2]
    f = v - i1
    return int(r1 + f*(r2-r1)), int(g1 + f*(g2-g1)), int(b1 + f*(b2-b1)), int(a1 + f*(a2-a1))

def draw_shadow(draw,x,y,text,font,shadowcolor="black"):
    # thin border
    draw.text((x-1, y-1), text, font=font, fill=shadowcolor)
    draw.text((x+1, y+1), text, font=font, fill=shadowcolor)
    draw.text((x+1, y-1), text, font=font, fill=shadowcolor)
    draw.text((x-1, y+1), text, font=font, fill=shadowcolor)

def process(cardid, font_name=english_font, language='enUS', dest=tile_dest):
    card = card_dict[cardid]
    name = card['name'][language]
    if 'cost' not in card:
    #    process_hero(card)
        return
    width = 243
    height = 39
    color_palette = [(41,48,58,255), (93, 68, 68, 0)]

    xoff = 105
    minx = 129
    maxx = 245

    image = '{}{}.png'.format(tile_loc, card['id'])
    try:
        im = Image.open(image)
    except Exception as e:
        print(e)
        return
    master = Image.new('RGBA', (width, height))
    master.paste(im, (xoff,3, xoff+130, 37))
    gradient = Image.new('RGBA', (width, height))
    draw = ImageDraw.Draw(gradient)
    draw.rectangle([(20, 0), (minx, 39)], fill=color_palette[0])
    for x in range(minx, maxx):
        color = interpolate_color(minx, maxx, x, color_palette)
        draw.line([(x,0), (x,39)], fill=color)
    master = Image.alpha_composite(master, gradient)
    draw = ImageDraw.Draw(master)
    if len(name)>22:
      font_size = 12
    else:
      font_size = 13

    def writeCost():
        font = ImageFont.truetype(english_font, 18)
        msg = str(card['cost'])
        w, h = draw.textsize(msg, font=font)
        ##changethis
        draw_shadow(draw,(44-w)/2,(39-h)/2-1,str(card['cost']), font)
        draw.text(((44-w)/2, (39-h)/2-1), str(card['cost']), font=font)
    
    font = ImageFont.truetype(font_name, font_size)
    w, h = draw.textsize(name, font=font)
    draw_shadow(draw, 45, (39-h)/2, name, font)
    draw.text((45, (39-h)/2), name, font=font)
    if card['rarity']=='LEGENDARY':
        bg = Image.open(tile_container_number)
        master.paste(bg, (0, 0, 239, 39), bg)
        imstar = Image.open(star)
        master.paste(imstar, (214, 10, 233, 29), imstar)

        writeCost()

        master.save(u'{}{}.png'.format(dest,cardid), 'PNG')
    else:
        bg = Image.open(tile_container_open)
        master.paste(bg, (0, 0, 239, 39), bg)

        writeCost()

        master.save(u'{}{}.png'.format(dest,cardid), 'PNG')

        bg = Image.open(tile_container_number)

        master.paste(bg, (0, 0, 239, 39), bg)
        font = ImageFont.truetype(english_font, 16)
        w, h = draw.textsize('2', font=font)
        draw.text(((30-w)/2+209,(39-h)/2), '2', font=font, fill=(229, 181, 68))

        writeCost()

        master.save(u'{}{}_2.png'.format(dest,cardid), 'PNG')

def process_hero(card):
    if card['set'] != 'CORE':
        return
    title = card['cardClass'][0].upper()+card['cardClass'][1:].lower()+' Deck'
    imclass = Image.open('resources/{}.jpg'.format(card['cardClass'].lower()))
    draw = ImageDraw.Draw(imclass)
    font = ImageFont.truetype(name_font, 19)
    w,h = draw.textsize(title, font=font)
    draw_shadow(draw, 22, 75-h, title, font)
    draw.text((22, 75-h), title, font=font)
    imclass.save('{}/{}.jpg'.format(hero_dest, card['cardClass'].lower()))
    onetwothree = ['Primary', 'Secondary', 'Tertiary']
    for i in range(3):
        title = onetwothree[i]+' Deck'
        imclass = Image.open('resources/{}.jpg'.format(card['cardClass'].lower()))
        draw = ImageDraw.Draw(imclass)
        font = ImageFont.truetype(name_font, 19)
        w,h = draw.textsize(title, font=font)
        draw_shadow(draw, 22, 75-h, title, font)
        draw.text((22, 75-h), title, font=font)
        imclass.save('{}/{}_{}.jpg'.format(hero_dest, card['cardClass'].lower(), i+1))


languageSettings = {'en':{'font_name': english_font, 'language':'enUS', 'dest':tile_dest+'en/'}, 
'jp': {'font_name': asia_font, 'language':'jaJP', 'dest':tile_dest+'jp/'}, 
'cn': {'font_name': chinese_font, 'language':'zhCN', 'dest':tile_dest+'cn/'}}
for language in languageSettings:
    settings = languageSettings[language]
    print("Generating tiles in {}".format(settings['dest']))
    if not os.path.exists(settings['dest']):
        os.makedirs(settings['dest'])
    for card in card_dict:
        process(card, settings['font_name'], settings['language'], settings['dest'])

#if not os.path.exists(hero_dest):
#    os.mkdir(hero_dest)

print("Finished generating tiles")
