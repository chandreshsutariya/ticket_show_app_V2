from flask import (Flask, 
                   render_template_string, 
                   session, 
                   redirect, 
                   url_for, 
                   render_template,
                   jsonify,
                   request)
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

from flask_security_config import DevelopmentConfig
from flask_security import (
    UserMixin, 
    RoleMixin, 
    SQLAlchemyUserDatastore, 
    Security,
    hash_password,
    auth_required,
    roles_accepted,
    current_user
)


from celery_config import make_celery
from celery.result import AsyncResult
from celery.schedules import crontab
# import time

from httplib2 import Http
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

from jinja2 import Template

# *************** USER DEFINED FUNCTIONS *************



# *************** ENDS USER DEFINED FUNCTIONS *************
# *************** MODEL *************
db = SQLAlchemy()

roles_users = db.Table('roles_users',
                       db.Column('user_id', db.Integer(),
                                 db.ForeignKey('user.id')),
                       db.Column('role_id', db.Integer(),
                                 db.ForeignKey('role.id')))


class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    username = db.Column(db.String, unique=False)
    email = db.Column(db.String, unique=True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    last_logout_at = db.Column(db.String(255), nullable=True)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    role = db.Column(db.String(80))
    roles = db.relationship('Role', secondary=roles_users,
                            backref=db.backref('users', lazy='dynamic'))

class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class Venue(db.Model):
    __tablename__ = 'venue'
    id = db.Column(db.Integer(), primary_key=True)
    venue_name = db.Column(db.String(255), unique=True)
    place = db.Column(db.String(255))
    location = db.Column(db.String(255))
    capacity = db.Column(db.Integer())

class Show(db.Model):
    __tablename__ = 'show'
    id = db.Column(db.Integer(), primary_key=True)
    venue_id = db.Column(db.Integer())
    show_name = db.Column(db.String(255))
    rating = db.Column(db.String(80))
    date = db.Column(db.String(80))
    timing_starts = db.Column(db.String(80))
    timing_ends = db.Column(db.String(80))
    tags = db.Column(db.String(255))
    price = db.Column(db.Integer())
    seats = db.Column(db.Integer())
    booked_seats = db.Column(db.Integer())

class Bookings(db.Model):
    __tablename__ = 'bookings'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column(db.Integer())
    venue_id = db.Column(db.Integer())
    show_id = db.Column(db.Integer())
    seats_booked = db.Column(db.Integer())
# ************* MODEL ENDS ************






# ************* CONFIGURATIONS ************
# ************* ENDS CONFIGURATIONS ************







#  ************ INITIALIZATIONS *******
app = Flask(__name__)
app.config.from_object(DevelopmentConfig)

datastore = SQLAlchemyUserDatastore(db, User, Role)
db.init_app(app)

security = Security(app, datastore)


from flask_caching import Cache
app.config.update(
    DEBUG= True,          # some Flask specific configs
    CACHE_TYPE= "RedisCache",  # Flask-Caching related configs
    CACHE_DEFAULT_TIMEOUT= 300
    )
cache=Cache(app)




app.config.update(
    CELERY_BROKER_URL='redis://localhost:6379/0',
    CELERY_RESULT_BACKEND='redis://localhost:6379/1',
    REDIS_URL = 'redis://localhost:6379'
)
celery = make_celery(app)




SMPTP_SERVER_HOST = 'localhost'
SMPTP_SERVER_PORT = 1025
SENDER_ADDRESS = '21f3001415@ds.study.iitm.ac.in'
SENDER_PASSWORD = 'password'
#  ************ INITIALIZATIONS ENDS *******







#  ************ CREATING ROLES & USERS *******
with app.app_context():
    security.datastore.db.create_all()    
    security.datastore.find_or_create_role(name="admin", description='For Admin only!')
    security.datastore.find_or_create_role(name="user", description='For Users only!')

    if not security.datastore.find_user(email="admin@me.com"):
        security.datastore.create_user(
            email="admin@me.com",
            password=hash_password("password"),
            role = 'admin',
            roles=["admin"],
        )
    if not security.datastore.find_user(email="user@me.com"):
        security.datastore.create_user(
            email="user@me.com",
            password=hash_password("password"),
            role = 'user',
            roles=["user"],
        )
    security.datastore.db.session.commit()
#  ************ ENDING CREATING ROLES & USERS *******








#  ************ CELERY/AUTOMATION WORKS *******
@celery.task
def generate_csv(venue_id):
    # importing the csv module
    import csv
    
    # field names
    fields = ['show_name', 'rating', 'date', 'starting_time', 'ending_time', 'tags','ticket_price', 'seats', 'booked_seats']
    
    r2=[]
    shows=Show.query.all()
    venue=Venue.query.get(venue_id)
    for show in shows:
        if show.venue_id == venue_id:
            l=[]
            l.append(show.show_name) 
            l.append(show.rating)
            l.append(show.date)
            l.append(show.timing_starts)
            l.append(show.timing_ends)
            l.append(show.tags)
            l.append(show.price)
            l.append(show.seats)
            l.append(show.booked_seats)
            r2.append(l)   
    print('r2',r2)
    with open(f"static/{venue.venue_name}.csv", 'w') as csvfile:
        writer=csv.writer(csvfile)
        writer.writerow(fields)
        writer.writerows(r2)
    return "File is ready!"



@app.route("/trigger_export_data_job/", methods=['POST'])
def trigger_export_data_job():
    data=request.json
    venue_id=data.get('venue_id')
    
    job=generate_csv.delay(venue_id)
    venue=Venue.query.get(venue_id)
    print(venue_id)
    return {
        'task_id':job.id,
        'task_state':job.state,
        'task_result':job.result,
        'venue_name':venue.venue_name
    }

@app.route("/find_status_of_the_job/", methods=['POST'])
def find_status_of_the_job():
    data=request.json
    task_id=data.get('task_id')
    
    job=AsyncResult(task_id, app=celery)

    print(job.id)
    return {
        'task_id':job.id,
        'task_state':job.state,
        'task_result':job.result
    }

def send_email(to_address, subject, message, content, attachment_file=None):
    msg=MIMEMultipart()
    msg['From']=SENDER_ADDRESS
    msg['To']=to_address
    msg['Subject']=subject

    if content =='html':
        msg.attach(MIMEText(message,'html'))
    else:
        msg.attach(MIMEText(message, 'plain'))

    # if attachment_file:
    #     with open(attachment_file, 'rb') as attachment:
    #         #Add file as application/octet-stream
    #         part=MIMEBase('application', 'octet-stream')
    #         part.set_payload(attachment.read())
    #     #Email attachments are sent as base64 encoded
    #     encoders.encode_base64(part)
    #     msg.attach(part)
    
    s = smtplib.SMTP(host=SMPTP_SERVER_HOST, port=SMPTP_SERVER_PORT)
    # s.starttls()
    s.login(SENDER_ADDRESS, SENDER_PASSWORD)
    s.send_message(msg)
    s.quit()
    return True

@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Calls test('hello') every 10 seconds.
    # sender.add_periodic_task(30.0, send_reminder_via_email.s(), name='daily reminder')
    sender.add_periodic_task(15.0, send_DailyReminder_via_email.s(), name='daily reminder')
    sender.add_periodic_task(10.0, send_MonthlyReminder_via_email.s(), name='monthly reminder')

def find_day_difference_timestamp(d1):
    d2 = datetime.today()
    d1=datetime.strptime(d1, '%Y-%m-%d %H:%M:%S')
    de = d2 - d1
    return de.days

@celery.task
def send_DailyReminder_via_email():
    users = User.query.all()
    for user in users:
        if find_day_difference_timestamp(user.last_logout_at) >= 1:
            send_email(
                to_address=user.email,
                content='text',
                subject='Daily reminder',
                message='Hello !! check out new shows on our website.',
                    )
    return 'Email should arrive in your inbox shortly.'

@celery.task
def send_MonthlyReminder_via_email():
    this_month = datetime.today().month
    this_year = datetime.today().year    
    
    users = User.query.all()
    bookings = Bookings.query.all()
    
    data = {}
    for booking in bookings:
        show = Show.query.get(booking.show_id)
        show_date = datetime.strptime(show.date, '%Y-%m-%d')
        show_month = show_date.month
        show_year = show_date.year
        if show_year==this_year and this_month-show_month==1:
            if booking.user_id not in data:
                data[booking.user_id]={1:{"name":show.show_name, 
                                       "total_bookings":booking.seats_booked, 
                                       "total_amount_spent":booking.seats_booked*show.price}}
            else:
                current_len = len(data[booking.user_id])
                data[booking.user_id][current_len+1]={"name":show.show_name, 
                                       "total_bookings":booking.seats_booked, 
                                       "total_amount_spent":booking.seats_booked*show.price}
    d = {}
    for user_id in data:
        user = User.query.get(user_id)
        d[user.email]= data[user_id]
    for user in users:
        if user.email not in d:
            d[user.email]={}
            
    for user_email in d:
        with open("MonthlyReminder.html") as file_:
            template = Template(file_.read())
            message = template.render(data=d[user_email], email=user_email)       
        send_email(
            to_address=user_email,
            content='html',
            subject='Monthly report',
            message=message)
    return 'Email should arrive in your inbox shortly.'


@app.route("/MonthlyReminder")
def check():
    this_month = datetime.today().month
    this_year = datetime.today().year    
    
    users = User.query.all()
    bookings = Bookings.query.all()
    
    data = {}
    for booking in bookings:
        show = Show.query.get(booking.show_id)
        show_date = datetime.strptime(show.date, '%Y-%m-%d')
        show_month = show_date.month
        show_year = show_date.year
        if show_year==this_year and this_month-show_month==1:
            if booking.user_id not in data:
                data[booking.user_id]={1:{"name":show.show_name, 
                                       "total_bookings":booking.seats_booked, 
                                       "total_amount_spent":booking.seats_booked*show.price}}
            else:
                current_len = len(data[booking.user_id])
                data[booking.user_id][current_len+1]={"name":show.show_name, 
                                       "total_bookings":booking.seats_booked, 
                                       "total_amount_spent":booking.seats_booked*show.price}
                # print(data)
    d = {}
    for user_id in data:
        user = User.query.get(user_id)
        d[user.email]= data[user_id]
    
    return render_template("./MonthlyReminder.html", data=d[user@me.com], email=user_email)

#  ************ ENDS CELERY WORKS *******
#  ************ CRUD users *******
@app.route("/read_users/")
def read_users():
    users = User.query.all()
    emails=[]

    for each in users:
        emails.append(each.email)

    return jsonify({1:emails})

#  ************ ENDS CRUD users *******
#  ************ CRUD venue *******
@app.route("/create_venue/", methods=['POST'])
@auth_required()
@roles_accepted('admin')
def create_venue():
    data = request.json
    venue_name = data.get('venue_name')
    place = data.get('place')
    location = data.get('location')
    capacity = data.get('capacity')

    if venue_name == '':
        return jsonify(f'Venue name can not be empty.')


    venues = Venue.query.all()
    for each in venues:
        if each.venue_name == venue_name:
            return jsonify(f'Venue name:{venue_name} is already present!, please make a different venue name.')

    venue = Venue(venue_name = venue_name, place = place, location= location, capacity = capacity)
    security.datastore.db.session.add(venue)
    security.datastore.db.session.commit()
    return jsonify('Venue created!'), 200

@app.route("/read_venue/")
@auth_required()
def read_venue():
    Venues = Venue.query.all()
    V = {}
    for each in Venues:
        V[each.id] = {'id': each.id,
                            'venue_name':each.venue_name,
                              'place':each.place,
                              'location':each.location,
                              'capacity':each.capacity}
    return jsonify(V)


@app.route("/read_single_venue/<venue_name>")
@auth_required()
def read_single_venue(venue_name):
    Venue_ = Venue.query.filter_by(venue_name=venue_name).first()
    print(venue_name)
    print(Venue_)
    V = {'venue_name':Venue_.venue_name,
        'place':Venue_.place,
        'location':Venue_.location,
        'capacity':Venue_.capacity}
    print(V)
    return jsonify(V)



@app.route("/edit_venue/", methods=['POST'])
@auth_required()
@roles_accepted('admin')
def edit_venue():
    data = request.json
    original_venue_name = data.get('original_venue_name')
    venue_name = data.get('venue_name')
    place = data.get('place')
    location = data.get('location')
    capacity = data.get('capacity')

    if original_venue_name == venue_name:
        pass
    else:
        venues = Venue.query.filter_by(venue_name = venue_name).all()
        if len(venues)>0:
            return jsonify(f'Venue name is already present!, please make a different venue name.')


    venue = Venue.query.filter_by(venue_name = original_venue_name).first()
    venue.venue_name = venue_name
    venue.place = place
    venue.location = location
    venue.capacity = capacity
    security.datastore.db.session.commit()
    return jsonify('Venue created!'), 200

@app.route("/delete_venue", methods=['POST'])
@auth_required()
@roles_accepted('admin')
def delete_venue():
    data = request.json
    venue_name = data.get('venue_name')
    print(venue_name)
    venue = Venue.query.filter_by(venue_name=venue_name).first()
    print(venue)
    security.datastore.db.session.delete(venue)
    security.datastore.db.session.commit()
    return jsonify('Venue deleted!'), 200
#  ************ END CRUD venue *******
#  ************ CRUD show *******
@app.route('/create_show/', methods=['POST'])
@auth_required()
@roles_accepted('admin')
def create_show():
    data = request.json
    print(data)

    venue_name = data.get('venue_name')
    show_name = data.get('show_name')
    rating = data.get('rating')
    date = data.get('date')
    timing_starts = data.get('timing_starts')
    timing_ends = data.get('timing_ends')
    tags = data.get('tags')
    price = data.get('price')
    seats = data.get('seats')

    print(venue_name)

    if show_name=='':
        return jsonify('Show name can not be empty.')
    
    try:
        int(price)
    except:
        return jsonify('The price must be numerical.')
    
    try:
        int(seats)
    except:
        return jsonify('The seats must be numerical.')
    
    venue = Venue.query.filter_by(venue_name = venue_name).first()
    venue_id = venue.id

    show = Show.query.filter_by(venue_id=venue_id, show_name = show_name).all()
    if len(show)>0:
        return jsonify(f'Show name:{show_name} is already there! Create a different show name!')
    
    if int(seats) > venue.capacity:
        return jsonify(f'Venue Capacity:{venue.capacity}.')



    show = Show(venue_id=venue_id,show_name = show_name,date=date, timing_starts=timing_starts, timing_ends = timing_ends, rating = rating, tags = tags, price=price, seats= seats, booked_seats=0)
    security.datastore.db.session.add(show)
    security.datastore.db.session.commit()
    return jsonify('show is created!')

def find_day_difference(d1):
    d1=datetime.strptime(d1, '%Y-%m-%d')
    d2 = datetime.today()
    de = d2 - d1
    return de.days


@app.route("/read_show/")
@auth_required()
def read_show():
    Shows = Show.query.all()
    S = {}
    for each in Shows:
        if find_day_difference(each.date)<1:
            S[each.id] = {'id':each.id,
                                'venue_id':each.venue_id,
                                'show_name':each.show_name,
                                'rating':each.rating,
                                'date': each.date,
                                'timing_starts': each.timing_starts,
                                'timing_ends': each.timing_ends,
                                'tags': each.tags,
                                'price': each.price,
                                'seats': each.seats,
                                'booked_seats': each.booked_seats
                                }
    return jsonify(S)






@app.route("/read_single_show/<show_id>")
@auth_required()
def read_single_show(show_id):
    each = Show.query.get(show_id)
    print(show_id)
    print(each)
    S = {'id':each.id,
        'venue_id':each.venue_id,
        'show_name':each.show_name,
        'rating':each.rating,
        'date': each.date,
        'timing_starts': each.timing_starts,
        'timing_ends': each.timing_ends,
        'tags': each.tags,
        'price': each.price,
        'seats': each.seats,
        'booked_seats': each.booked_seats

        }
    print(S)
    return jsonify(S)






@app.route("/edit_show/", methods=['POST'])
@auth_required()
@roles_accepted('admin')
def edit_show():
    data = request.json

    show_id = data.get('show_id')

    show_name = data.get('show_name')
    rating = data.get('rating')
    date = data.get('date')
    timing_starts = data.get('timing_starts')
    timing_ends = data.get('timing_ends')
    tags = data.get('tags')
    price = data.get('price')
    seats = data.get('seats')

    show = Show.query.get(show_id)
    venue_id = show.venue_id

    shows = Show.query.all()


    if show_name=='':
        return jsonify('Show name can not be empty.')
    
    try:
        int(price)
    except:
        return jsonify('The price must be numerical.')


    try:
        int(seats)
    except:
        return jsonify('The seats must be numerical.')
    

    for each in shows:
        if each.venue_id == venue_id:
            if each.id != show_id:
                if each.show_name == show_name:
                    return jsonify('Show name can not be same in the same venue.')
    
    venue = Venue.query.get(venue_id)

    if int(seats) > venue.capacity:
        return jsonify(f'Venue Capacity:{venue.capacity}.')

    if int(seats) < show.booked_seats:
        return jsonify(f"Booked seats are: {show.booked_seats}, and you can't now reduce the seats, as the people have already booked the seats.")

    show.show_name = show_name
    show.rating = rating
    show.date = date
    show.timing_starts = timing_starts
    show.timing_ends = timing_ends
    show.tags = tags
    show.price = price
    show.seats = seats


    security.datastore.db.session.commit()
    return jsonify('Show created!'), 200








@app.route("/delete_show", methods=['POST'])
@auth_required()
@roles_accepted('admin')
def delete_show():
    data = request.json
    id = data.get('id')
    print(id)
    show = Show.query.get(id)
    print(show)
    security.datastore.db.session.delete(show)
    security.datastore.db.session.commit()
    return jsonify('Show deleted!'), 200
#  ************ END CRUD shows *******
#  ************ CRUD booking *******
@app.route("/check_seats_availability/", methods=['POST'])
@auth_required()
def check_seats_availability():
    data=request.json
    show_id=data.get('show_id')
    
    show=Show.query.get(show_id)
    if show.seats-show.booked_seats >0:
        return jsonify('seats are available')
    else:
        return jsonify('seats are not available')
    

@app.route("/book_show/", methods=['POST'])
@auth_required()
def book_show():
    data=request.json
    show_id=data.get('show_id')
    numbers=data.get('numbers')

    try:
        int(numbers)
    except:
        return jsonify('The Numbers must be numerical.')
    
    show=Show.query.get(show_id)

    available_seats = show.seats-show.booked_seats
    if int(numbers) > available_seats:
        return jsonify(f'Only {available_seats} seats are available!!')
    
    booking = Bookings(user_id=current_user.id,venue_id = show.venue_id ,show_id=show_id, seats_booked=numbers)
    show.booked_seats = int(show.booked_seats)+int(numbers)
    security.datastore.db.session.add(booking)
    security.datastore.db.session.commit()
    return jsonify('show is booked!')


@app.route("/read_bookings/")
@cache.cached(timeout=10)
@auth_required()
def read_bookings():
    user_id=current_user.id

    bookings=Bookings.query.all()

    B={}
    for each in bookings:
        if each.user_id==user_id:
            venue=Venue.query.get(each.venue_id)
            show=Show.query.get(each.show_id)
            B[each.id]={
                'id':each.id,
                'user_id':each.user_id,
                'venue_id':each.venue_id,
                'show_id':each.show_id,
                'seats_booked':each.seats_booked,
                'venue_name':venue.venue_name,
                'show_date':show.date,
                'show_price':show.price,
                'show_name':show.show_name,
                'timing_starts':show.timing_starts,
                'timing_ends':show.timing_ends
            }
    return jsonify(B)




#  ************ End CRUD booking *******






@app.route("/")
def home():
    return render_template('home.html')

@app.route("/signup/", methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    print(data)
    if not security.datastore.find_user(email=email):
        security.datastore.create_user(
            email=email,
            password=hash_password(password),
            role = 'user',
            roles=["user"],
        )
    security.datastore.db.session.commit()
    
    return jsonify('User is successfully created. Now you can login to my system.')
        

@app.route("/loginn")
@auth_required()
def login():
    print(current_user.role)
    if current_user.role == 'admin':
            return render_template('admin_home.html')
    else:
        return render_template('user_home.html')
    


@app.route("/find_current_user/")
@auth_required()
def find_current_user():
    return jsonify(f'{current_user.email}')
    

@app.route("/update_timestamp")
@auth_required()
def update_timestamp():
    user = current_user
    print(user)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(timestamp)
    user.last_logout_at = timestamp
    security.datastore.db.session.commit()
    return jsonify('hi')

# @app.route('/logout')
# def logout():
#     session.pop('authentication_token', None)
#     return redirect('/')


@app.route('/index')
def index():
    return render_template('index.html')










if __name__=='__main__':
    app.run(debug=True)

