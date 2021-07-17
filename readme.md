# GPSERVER

Server for media streaming/management

### Prerequisites
1. Make sure the computer where this script is running has the `ffmpeg` command
```
# Ubuntu
sudo apt install ffmpeg
```

### Running

1. Add `.env` file containing
```
SERVER_PORT=8078
HOME_DIR=/home/etc/etc # absolute path to media dir
```

2. Run 
```
go build
```