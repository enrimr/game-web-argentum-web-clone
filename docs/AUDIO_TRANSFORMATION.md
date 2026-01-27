find resources/audio -type f -iname "*.wav" -exec sh -c 'ffmpeg -y -i "$1" "${1%.wav}.ogg"' _ {} \;

find resources/audio -type f -iname "*.flac" -exec sh -c 'ffmpeg -y -i "$1" "${1%.flac}.ogg"' _ {} \;
