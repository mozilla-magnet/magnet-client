# Imports the monkeyrunner modules used by this program
from com.android.monkeyrunner import MonkeyRunner, MonkeyDevice, MonkeyImage

# Connects to the current device, returning a MonkeyDevice object

def main():
    print('Starting')
    device = MonkeyRunner.waitForConnection()
    print(device)

    # Installs the Android package. Notice that this method returns a boolean, so you can test
    # to see if the installation worked.
    
    device.installPackage('/home/travis/build/mozilla-magnet/magnet-client//android/app/build/output/apk/app-release.apk')

    # sets a variable with the package's internal name
    package = 'org.mozilla.magnet'

    # sets a variable with the name of an Activity in the package
    activity = 'org.mozilla.magnet.MainActivity'

    # sets the name of the component to start
    runComponent = package + '/' + activity

    # Runs the component
    device.startActivity(component=runComponent)

    # Wait for the UI
    MonkeyRunner.sleep(5.0)

    # Presses the Menu button
    device.press('KEYCODE_MENU', MonkeyDevice.DOWN_AND_UP)

#start
main()