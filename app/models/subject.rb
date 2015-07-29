require 'gcm'

class Subject < ActiveRecord::Base
  has_and_belongs_to_many :users

  def self.search(keyword)
    query = ''
    for c in keyword.split(//u) do query << '%' + c end
    query << '%'
    if keyword
      where('subject_name LIKE ?', query)
    else
      all
    end
  end

  def self.push_all
    sleep 20
    puts "start push"
    Subject.includes(:users).where.not(users: {id: nil}).each do |subject|
      #짝홀 제한
      subject.push() if (if subject.capacity_enrolled == 0 then subject.capacity / 2 * 2  > subject.enrolled else subject.capacity_enrolled / 2 * 2 > subject.enrolled end)

      #짝홀 제한 해제
      #subject.push() if (if subject.capacity_enrolled == 0 then subject.capacity > subject.enrolled else subject.capacity_enrolled > subject.enrolled end)

      #전체학번 신청 || 전체학번 수강신청변경기간
      #subject.push() if subject.capacity > subject.enrolled
    end
    puts "finish push"
    return nil
  end

  def push
    a = users
    if a.length != 0
      gcm = GCM.new("AIzaSyD5TpX92jUTpUwN4wJwK-gf8qJbRwvA73Y")
      registration_ids = Array.new
      for user in a
        registration_ids << user.reg_id
      end
      options = {data: {msg: "available", subject_name: subject_name, id: id, lecturer: lecturer, subject_number: subject_number, lecture_number: lecture_number } }
      response = gcm.send_notification(registration_ids, options)
    end
    return nil
  end
end
