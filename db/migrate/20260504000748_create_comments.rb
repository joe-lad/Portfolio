class CreateComments < ActiveRecord::Migration[8.1]
  def change
    create_table :comments do |t|
      t.string :name
      t.string :email
      t.text :body
      t.boolean :approved, default: false, null: false

      t.timestamps
    end
  end
end
