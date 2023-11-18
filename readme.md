# **To run/start the Application**



1. <h4>Run Flask Application: </h4>
    Open WSL with root folder path and do the do the followings.


    1.  Make virtual environment in root folder with following code.

    > virtualenv .env

    2. Activate the vertual environment you created in above step - by following code.
    >source .env/bin/activate

    3.  Install all requirements from file `requirements.txt` by following code to the vertual environment.

    > pip install -r requirements.txt

    4. Run the python application file - `app.py`

    > python app.py

note: if you have different command to call python terminal than `py`, like `python`, `python3`, use it instead of `pyhton` in all above commands.

2. <h4> Run redis server: </h4>
    Open WSL with root folder path and do the do the followings.


    1.  Run the following code

    > redis-server


3. <h4>Run mailhog server: </h4>
    Open WSL with root folder path and do the do the followings.


    1.  Run the following code.

    > Mailhog

    If mailhog is not installed in the home direcory, first do that. You can visit mailhog github page for that.

4. <h4>Run celery workers: </h4>
    Open WSL with root folder path and do the do the followings.


    1. Activate the vertual environment.
    >source .env/bin/activate

    2.  Run the celery worker server

    > celery -A app.celery worker -l info

5. <h4>Run celery beat: </h4>
    Open WSL with root folder path and do the do the followings.


    1. Activate the vertual environment.
    >source .env/bin/activate

    2.  Run the celery worker beat

    > celery -A app.celery beat --max-interval 2 -l info