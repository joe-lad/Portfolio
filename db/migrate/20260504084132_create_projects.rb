class CreateProjects < ActiveRecord::Migration[8.1]
  def change
    create_table :projects do |t|
      t.string :title
      t.string :subtitle
      t.boolean :featured

      t.timestamps
    end
  end
end
