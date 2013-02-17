#!/usr/bin/env python

import sys

import gdata.media
import gdata.youtube
import gdata.youtube.service


########################################################
## HOW TO USE
##
## 1st Param is file path.
## 2nd Param is file name.
#######################################################
argvs = sys.argv

yt_service = gdata.youtube.service.YouTubeService()

yt_service.email = 'kabutomushi.hd@gmail.com'
yt_service.password = 'kabutomushi'
yt_service.developer_key = 'AI39si7VFvglYKc-6oY1jHZSO9lLhPm44cGwMNC19b5_0ABP2enhCZJ36vjwDR7W0l5IsM5YwA6bfoUsQdwC9EHVVg85H2jDIA'

yt_service.source = 'my-example-application'
yt_service.client_id = 'my-example-application'

yt_service.ProgrammaticLogin()

#video_file_location = './movie/test.mp4'
video_file_location = argvs[1]

my_media_group = gdata.media.Group(
	#title=gdata.media.Title(text='My Test Movie'),
	title=gdata.media.Title(text=argvs[2]),
	description=gdata.media.Description(description_type='plain',
	    text='My description'),
	keywords=gdata.media.Keywords(text='cars, funny'),
	category=[gdata.media.Category(
	    text='Autos',
	    scheme='http://gdata.youtube.com/schemas/2007/categories.cat',
	    label='Autos')],
	#player=None,
	#private=gdata.media.Private()
	player=None
)

video_entry = gdata.youtube.YouTubeVideoEntry(media=my_media_group)

new_entry = yt_service.InsertVideoEntry(video_entry, video_file_location)

print new_entry
